"""
Tests para ML API
"""

from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
import uuid

from .models import MLModel, TrainingJob, Prediction


class MLModelTests(TestCase):
    """Tests para modelos de ML"""

    def setUp(self):
        self.model = MLModel.objects.create(
            model_type='ETA',
            version='1.0',
            file_path='eta_model.pkl',
            accuracy=0.85,
            r2_score=0.82,
            rmse=2.5,
            mae=1.8,
            training_data_size=500
        )

    def test_model_creation(self):
        """Test creación de modelo"""
        self.assertEqual(self.model.model_type, 'ETA')
        self.assertEqual(self.model.version, '1.0')
        self.assertTrue(self.model.is_active)

    def test_model_str(self):
        """Test string representation"""
        self.assertIn('ETA', str(self.model))


class TrainingJobTests(TestCase):
    """Tests para trabajos de entrenamiento"""

    def setUp(self):
        self.job = TrainingJob.objects.create(
            model_type='TRAFFIC',
            status='PENDING'
        )

    def test_job_creation(self):
        """Test creación de job"""
        self.assertEqual(self.job.status, 'PENDING')
        self.assertIsNone(self.job.completed_at)

    def test_job_completion(self):
        """Test completar job"""
        model = MLModel.objects.create(
            model_type='TRAFFIC',
            version='1.0',
            file_path='traffic_model.pkl'
        )

        self.job.status = 'COMPLETED'
        self.job.model = model
        self.job.save()

        self.job.refresh_from_db()
        self.assertEqual(self.job.status, 'COMPLETED')
        self.assertEqual(self.job.model.id, model.id)


class PredictionTests(TestCase):
    """Tests para predicciones"""

    def setUp(self):
        self.model = MLModel.objects.create(
            model_type='ETA',
            version='1.0',
            file_path='eta_model.pkl'
        )

    def test_prediction_creation(self):
        """Test creación de predicción"""
        prediction = Prediction.objects.create(
            prediction_type='ETA_ARRIVAL',
            model=self.model,
            input_data={'distance_km': 10},
            input_hash='abc123',
            prediction_result={'eta_minutes': 25},
            confidence=0.85
        )

        self.assertEqual(prediction.prediction_type, 'ETA_ARRIVAL')
        self.assertEqual(prediction.confidence, 0.85)


class APITests(APITestCase):
    """Tests para endpoints REST"""

    def setUp(self):
        self.client = Client()
        self.base_url = '/api'

    def test_models_list(self):
        """Test listar modelos"""
        response = self.client.get(f'{self.base_url}/models/')
        self.assertEqual(response.status_code, 200)

    def test_active_models(self):
        """Test obtener modelos activos"""
        MLModel.objects.create(
            model_type='ETA',
            version='1.0',
            file_path='eta_model.pkl',
            is_active=True
        )

        response = self.client.get(f'{self.base_url}/models/active/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['ok'])

    def test_prediction_stats(self):
        """Test estadísticas de predicciones"""
        response = self.client.get(f'{self.base_url}/predictions/stats/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('by_type', data['data'])

    def test_make_eta_prediction(self):
        """Test hacer predicción ETA"""
        data = {
            'prediction_type': 'ETA_ARRIVAL',
            'input_data': {
                'distance_km': 10,
                'speed_kmh': 30,
                'hour_of_day': 14,
                'traffic_factor': 1.2
            }
        }

        response = self.client.post(
            f'{self.base_url}/predictions/predict/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertTrue(result['ok'])
        self.assertIn('data', result)


class IntegrationTests(TestCase):
    """Tests de integración"""

    def test_model_lifecycle(self):
        """Test ciclo de vida: crear job → entrenar → guardar modelo"""

        # 1. Crear job
        job = TrainingJob.objects.create(
            model_type='ETA',
            status='PENDING'
        )
        self.assertEqual(job.status, 'PENDING')

        # 2. Simular entrenamiento
        model = MLModel.objects.create(
            model_type='ETA',
            version='1.0',
            file_path='eta_model.pkl',
            r2_score=0.85,
            rmse=2.5
        )

        # 3. Actualizar job
        job.status = 'COMPLETED'
        job.model = model
        job.save()

        # 4. Verificar
        job.refresh_from_db()
        self.assertEqual(job.status, 'COMPLETED')
        self.assertEqual(job.model.model_type, 'ETA')
        self.assertTrue(job.model.is_active)

    def test_prediction_chain(self):
        """Test cadena de predicción"""

        # 1. Crear modelo
        model = MLModel.objects.create(
            model_type='ETA',
            version='1.0',
            file_path='eta_model.pkl'
        )

        # 2. Crear predicción
        prediction = Prediction.objects.create(
            prediction_type='ETA_ARRIVAL',
            model=model,
            input_data={'distance_km': 10},
            input_hash='test_hash',
            prediction_result={'eta_minutes': 25},
            confidence=0.85
        )

        # 3. Verificar auditoría
        self.assertEqual(Prediction.objects.count(), 1)
        self.assertEqual(prediction.model.model_type, 'ETA')


if __name__ == '__main__':
    import unittest
    unittest.main()
