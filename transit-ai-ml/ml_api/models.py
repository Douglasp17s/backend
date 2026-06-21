"""
Modelos para ML Service
"""

from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class MLModel(models.Model):
    """Información sobre modelos de ML entrenados"""
    MODEL_TYPES = [
        ('ETA', 'Predicción de ETA'),
        ('TRAFFIC', 'Detección de Tráfico'),
        ('ANOMALY', 'Detección de Anomalías'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_type = models.CharField(max_length=20, choices=MODEL_TYPES)
    version = models.CharField(max_length=50, default='1.0')
    file_path = models.CharField(max_length=500)

    # Métricas de entrenamiento
    accuracy = models.FloatField(null=True, blank=True)
    precision = models.FloatField(null=True, blank=True)
    recall = models.FloatField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    rmse = models.FloatField(null=True, blank=True)
    mae = models.FloatField(null=True, blank=True)
    r2_score = models.FloatField(null=True, blank=True)

    # Configuración
    hyperparameters = models.JSONField(default=dict, blank=True)
    training_data_size = models.IntegerField(default=0)
    feature_names = ArrayField(models.CharField(max_length=100), default=list)

    # Estados
    is_active = models.BooleanField(default=True)
    trained_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-trained_at']
        indexes = [
            models.Index(fields=['model_type', '-trained_at']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.get_model_type_display()} v{self.version}"


class TrainingJob(models.Model):
    """Registro de trabajos de entrenamiento"""
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('RUNNING', 'En ejecución'),
        ('COMPLETED', 'Completado'),
        ('FAILED', 'Fallido'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_type = models.CharField(max_length=20, choices=MLModel.MODEL_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)

    # Resultado
    model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True, blank=True)
    error_message = models.TextField(blank=True)
    logs = models.TextField(blank=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['model_type', 'status']),
        ]

    def __str__(self):
        return f"{self.get_model_type_display()} - {self.get_status_display()}"


class Prediction(models.Model):
    """Registro de predicciones realizadas"""
    PREDICTION_TYPES = [
        ('ETA_ARRIVAL', 'ETA de Llegada'),
        ('ROUTE_CONGESTION', 'Congestión de Ruta'),
        ('ANOMALY_DETECTION', 'Detección de Anomalía'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prediction_type = models.CharField(max_length=50, choices=PREDICTION_TYPES)
    model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True)

    # Inputs
    input_data = models.JSONField()
    input_hash = models.CharField(max_length=64, db_index=True)

    # Outputs
    prediction_result = models.JSONField()
    confidence = models.FloatField(default=0.0)

    # Validación (si se proporciona)
    actual_value = models.JSONField(null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['prediction_type', 'created_at']),
            models.Index(fields=['input_hash', 'expires_at']),
        ]

    def __str__(self):
        return f"{self.get_prediction_type_display()} - {self.confidence:.2f}"


class ModelMetrics(models.Model):
    """Métricas de desempeño de modelos en tiempo real"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.OneToOneField(MLModel, on_delete=models.CASCADE, related_name='current_metrics')

    # Métricas por período
    total_predictions_24h = models.IntegerField(default=0)
    avg_confidence_24h = models.FloatField(default=0.0)
    error_rate_24h = models.FloatField(default=0.0)

    total_predictions_7d = models.IntegerField(default=0)
    avg_confidence_7d = models.FloatField(default=0.0)
    error_rate_7d = models.FloatField(default=0.0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Metrics for {self.model}"


class DatasetVersion(models.Model):
    """Versiones de datasets para entrenamiento"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_type = models.CharField(max_length=20, choices=MLModel.MODEL_TYPES)
    version = models.CharField(max_length=50)

    row_count = models.IntegerField()
    file_path = models.CharField(max_length=500)

    # Estadísticas
    date_range_start = models.DateTimeField()
    date_range_end = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)
    used_for_training = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        unique_together = [['model_type', 'version']]

    def __str__(self):
        return f"{self.get_model_type_display()} Dataset v{self.version}"
