"""
Views/Endpoints para ML API
"""

import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import hashlib
import joblib
import numpy as np
from django.conf import settings

from .models import MLModel, TrainingJob, Prediction, ModelMetrics
from .serializers import (
    MLModelSerializer, TrainingJobSerializer, StartTrainingSerializer,
    PredictionSerializer, MakePredictionSerializer, ModelMetricsSerializer,
    ModelStatusSerializer
)
from .tasks import train_eta_model_task, train_traffic_model_task, train_anomaly_model_task
from .trainers import ETAModelTrainer, TrafficModelTrainer, AnomalyModelTrainer

logger = logging.getLogger(__name__)


class MLModelViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para modelos de ML"""
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtiene modelos activos"""
        models = MLModel.objects.filter(is_active=True)
        serializer = self.get_serializer(models, many=True)
        return Response({'ok': True, 'data': serializer.data})

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Obtiene estado detallado de un modelo"""
        model = self.get_object()

        try:
            metrics = ModelMetrics.objects.get(model=model)
            metrics_data = ModelMetricsSerializer(metrics).data
        except ModelMetrics.DoesNotExist:
            metrics_data = None

        return Response({
            'ok': True,
            'data': {
                'model': MLModelSerializer(model).data,
                'metrics': metrics_data
            }
        })


class TrainingJobViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para trabajos de entrenamiento"""
    queryset = TrainingJob.objects.all()
    serializer_class = TrainingJobSerializer

    @action(detail=False, methods=['post'])
    def start_training(self, request):
        """Inicia un trabajo de entrenamiento"""
        serializer = StartTrainingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        model_type = serializer.validated_data['model_type']

        # Mapear modelo a tarea Celery
        task_map = {
            'ETA': train_eta_model_task,
            'TRAFFIC': train_traffic_model_task,
            'ANOMALY': train_anomaly_model_task,
        }

        task = task_map.get(model_type)
        if not task:
            return Response(
                {'ok': False, 'error': f'Unknown model type: {model_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear job y encolar tarea
        try:
            job = TrainingJob.objects.create(
                model_type=model_type,
                status='PENDING'
            )
            task.delay()

            return Response({
                'ok': True,
                'data': TrainingJobSerializer(job).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error starting training: {e}")
            return Response(
                {'ok': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_model_type(self, request):
        """Obtiene jobs por tipo de modelo"""
        model_type = request.query_params.get('model_type')
        if not model_type:
            return Response(
                {'ok': False, 'error': 'model_type parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        jobs = TrainingJob.objects.filter(model_type=model_type).order_by('-started_at')
        serializer = self.get_serializer(jobs, many=True)
        return Response({'ok': True, 'data': serializer.data})


class PredictionViewSet(viewsets.ViewSet):
    """ViewSet para predicciones"""

    def list(self, request):
        """Lista predicciones recientes"""
        predictions = Prediction.objects.order_by('-created_at')[:100]
        serializer = PredictionSerializer(predictions, many=True)
        return Response({'ok': True, 'data': serializer.data})

    def retrieve(self, request, pk=None):
        """Obtiene una predicción específica"""
        try:
            prediction = Prediction.objects.get(id=pk)
            serializer = PredictionSerializer(prediction)
            return Response({'ok': True, 'data': serializer.data})
        except Prediction.DoesNotExist:
            return Response(
                {'ok': False, 'error': 'Prediction not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def predict(self, request):
        """Realiza una predicción"""
        serializer = MakePredictionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prediction_type = serializer.validated_data['prediction_type']
        input_data = serializer.validated_data['input_data']

        try:
            result = self._make_prediction(prediction_type, input_data)

            # Guardar predicción
            input_hash = hashlib.sha256(
                str(input_data).encode()
            ).hexdigest()

            prediction = Prediction.objects.create(
                prediction_type=prediction_type,
                input_data=input_data,
                input_hash=input_hash,
                prediction_result=result['data'],
                confidence=result.get('confidence', 0.0),
                expires_at=timezone.now() + timedelta(hours=24)
            )

            return Response({
                'ok': True,
                'data': {
                    'prediction_id': str(prediction.id),
                    'result': result['data'],
                    'confidence': result.get('confidence', 0.0)
                }
            })

        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            return Response(
                {'ok': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _make_prediction(self, prediction_type, input_data):
        """Realiza predicción usando modelo"""
        if prediction_type == 'ETA_ARRIVAL':
            return self._predict_eta(input_data)
        elif prediction_type == 'ROUTE_CONGESTION':
            return self._predict_traffic(input_data)
        elif prediction_type == 'ANOMALY_DETECTION':
            return self._predict_anomaly(input_data)
        else:
            raise ValueError(f"Unknown prediction type: {prediction_type}")

    def _predict_eta(self, input_data):
        """Predice ETA"""
        try:
            model_path = settings.MODELS_DIR / 'eta_model.pkl'
            scaler_path = settings.MODELS_DIR / 'eta_scaler.pkl'

            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)

            X = np.array([[
                input_data.get('distance_km', 10),
                input_data.get('speed_kmh', 30),
                input_data.get('hour_of_day', 12),
                input_data.get('traffic_factor', 1.0)
            ]])

            X_scaled = scaler.transform(X)
            eta_minutes = float(model.predict(X_scaled)[0])

            return {
                'data': {
                    'eta_minutes': max(5, min(180, eta_minutes)),
                    'model_type': 'ETA'
                },
                'confidence': 0.85
            }
        except Exception as e:
            logger.warning(f"Error predicting ETA: {e}, using default")
            return {'data': {'eta_minutes': 30}, 'confidence': 0.3}

    def _predict_traffic(self, input_data):
        """Predice congestión"""
        try:
            model_path = settings.MODELS_DIR / 'traffic_model.pkl'
            scaler_path = settings.MODELS_DIR / 'traffic_scaler.pkl'

            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)

            X = np.array([[
                input_data.get('speed_kmh', 30),
                input_data.get('vehicle_count', 50),
                input_data.get('hour_of_day', 12),
                input_data.get('day_of_week', 3)
            ]])

            X_scaled = scaler.transform(X)
            congestion_level = float(model.predict(X_scaled)[0])

            levels = ['BAJO', 'MODERADO', 'ALTO', 'CRITICO']
            level_idx = min(3, max(0, int(round(congestion_level))))

            return {
                'data': {
                    'congestion_level': levels[level_idx],
                    'level_numeric': level_idx,
                    'model_type': 'TRAFFIC'
                },
                'confidence': 0.80
            }
        except Exception as e:
            logger.warning(f"Error predicting traffic: {e}, using default")
            return {'data': {'congestion_level': 'MODERADO'}, 'confidence': 0.3}

    def _predict_anomaly(self, input_data):
        """Detecta anomalías"""
        try:
            model_path = settings.MODELS_DIR / 'anomaly_model.pkl'
            scaler_path = settings.MODELS_DIR / 'anomaly_scaler.pkl'

            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)

            X = np.array([[
                input_data.get('speed_kmh', 30),
                input_data.get('acceleration_mss', 0),
                input_data.get('stops_count', 5),
                input_data.get('route_deviation_meters', 100)
            ]])

            X_scaled = scaler.transform(X)
            prediction = int(model.predict(X_scaled)[0])
            is_anomaly = prediction == -1

            return {
                'data': {
                    'is_anomaly': is_anomaly,
                    'anomaly_score': float(abs(prediction)),
                    'model_type': 'ANOMALY'
                },
                'confidence': 0.75
            }
        except Exception as e:
            logger.warning(f"Error predicting anomaly: {e}, using default")
            return {'data': {'is_anomaly': False}, 'confidence': 0.3}

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de predicciones"""
        hours_24 = timezone.now() - timedelta(hours=24)

        stats = {
            'total_24h': Prediction.objects.filter(created_at__gte=hours_24).count(),
            'by_type': {}
        }

        for pred_type, _ in Prediction.PREDICTION_TYPES:
            count = Prediction.objects.filter(
                prediction_type=pred_type,
                created_at__gte=hours_24
            ).count()
            stats['by_type'][pred_type] = count

        return Response({'ok': True, 'data': stats})
