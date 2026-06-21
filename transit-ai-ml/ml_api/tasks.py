"""
Tareas asincrónicas con Celery
"""

import logging
from datetime import datetime, timedelta
from celery import shared_task
from django.utils import timezone
from .models import MLModel, TrainingJob, Prediction
from .trainers import ETAModelTrainer, TrafficModelTrainer, AnomalyModelTrainer

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def train_eta_model_task(self):
    """Tarea para entrenar modelo ETA"""
    job = None
    try:
        job = TrainingJob.objects.create(
            model_type='ETA',
            status='RUNNING'
        )
        logger.info(f"Starting ETA training job {job.id}")

        trainer = ETAModelTrainer()
        metrics = trainer.train()

        # Crear/actualizar modelo
        model = MLModel.objects.create(
            model_type='ETA',
            version='1.0',
            file_path='eta_model.pkl',
            accuracy=metrics.get('r2', 0),
            r2_score=metrics.get('r2'),
            rmse=metrics.get('rmse'),
            mae=metrics.get('mae'),
            training_data_size=500,
            feature_names=['distance_km', 'speed_kmh', 'hour_of_day', 'traffic_factor'],
            hyperparameters={'n_estimators': 100, 'max_depth': 20}
        )

        # Desactivar modelos anteriores
        MLModel.objects.filter(model_type='ETA').exclude(id=model.id).update(is_active=False)

        # Actualizar job
        job.status = 'COMPLETED'
        job.model = model
        job.completed_at = timezone.now()
        job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
        job.save()

        logger.info(f"ETA training completed: {metrics}")
        return {'ok': True, 'model_id': str(model.id), 'metrics': metrics}

    except Exception as e:
        logger.error(f"Error training ETA model: {e}")
        if job:
            job.status = 'FAILED'
            job.error_message = str(e)
            job.completed_at = timezone.now()
            job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
            job.save()

        # Reintentar en 5 minutos
        raise self.retry(exc=e, countdown=300)


@shared_task(bind=True, max_retries=3)
def train_traffic_model_task(self):
    """Tarea para entrenar modelo de tráfico"""
    job = None
    try:
        job = TrainingJob.objects.create(
            model_type='TRAFFIC',
            status='RUNNING'
        )
        logger.info(f"Starting Traffic training job {job.id}")

        trainer = TrafficModelTrainer()
        metrics = trainer.train()

        model = MLModel.objects.create(
            model_type='TRAFFIC',
            version='1.0',
            file_path='traffic_model.pkl',
            accuracy=metrics.get('r2', 0),
            r2_score=metrics.get('r2'),
            rmse=metrics.get('rmse'),
            mae=metrics.get('mae'),
            training_data_size=500,
            feature_names=['speed_kmh', 'vehicle_count', 'hour_of_day', 'day_of_week'],
            hyperparameters={'n_estimators': 100, 'max_depth': 15}
        )

        MLModel.objects.filter(model_type='TRAFFIC').exclude(id=model.id).update(is_active=False)

        job.status = 'COMPLETED'
        job.model = model
        job.completed_at = timezone.now()
        job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
        job.save()

        logger.info(f"Traffic training completed: {metrics}")
        return {'ok': True, 'model_id': str(model.id), 'metrics': metrics}

    except Exception as e:
        logger.error(f"Error training Traffic model: {e}")
        if job:
            job.status = 'FAILED'
            job.error_message = str(e)
            job.completed_at = timezone.now()
            job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
            job.save()

        raise self.retry(exc=e, countdown=300)


@shared_task(bind=True, max_retries=3)
def train_anomaly_model_task(self):
    """Tarea para entrenar modelo de anomalías"""
    job = None
    try:
        job = TrainingJob.objects.create(
            model_type='ANOMALY',
            status='RUNNING'
        )
        logger.info(f"Starting Anomaly training job {job.id}")

        trainer = AnomalyModelTrainer()
        metrics = trainer.train()

        model = MLModel.objects.create(
            model_type='ANOMALY',
            version='1.0',
            file_path='anomaly_model.pkl',
            training_data_size=metrics.get('total_samples', 500),
            feature_names=['speed_kmh', 'acceleration_mss', 'stops_count', 'route_deviation_meters'],
            hyperparameters={'contamination': 0.1}
        )

        MLModel.objects.filter(model_type='ANOMALY').exclude(id=model.id).update(is_active=False)

        job.status = 'COMPLETED'
        job.model = model
        job.completed_at = timezone.now()
        job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
        job.save()

        logger.info(f"Anomaly training completed: {metrics}")
        return {'ok': True, 'model_id': str(model.id), 'metrics': metrics}

    except Exception as e:
        logger.error(f"Error training Anomaly model: {e}")
        if job:
            job.status = 'FAILED'
            job.error_message = str(e)
            job.completed_at = timezone.now()
            job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
            job.save()

        raise self.retry(exc=e, countdown=300)


@shared_task
def cleanup_old_predictions():
    """Limpia predicciones expiradas"""
    try:
        now = timezone.now()
        deleted_count, _ = Prediction.objects.filter(expires_at__lt=now).delete()
        logger.info(f"Cleaned up {deleted_count} expired predictions")
        return {'ok': True, 'deleted': deleted_count}
    except Exception as e:
        logger.error(f"Error cleaning up predictions: {e}")
        raise
