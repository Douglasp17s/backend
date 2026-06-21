"""
Serializers para ML API
"""

from rest_framework import serializers
from .models import MLModel, TrainingJob, Prediction, ModelMetrics, DatasetVersion


class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = [
            'id', 'model_type', 'version', 'accuracy', 'precision',
            'recall', 'f1_score', 'rmse', 'mae', 'r2_score',
            'is_active', 'trained_at', 'updated_at', 'training_data_size'
        ]
        read_only_fields = ['id', 'trained_at', 'updated_at']


class TrainingJobSerializer(serializers.ModelSerializer):
    model = MLModelSerializer(read_only=True)

    class Meta:
        model = TrainingJob
        fields = [
            'id', 'model_type', 'status', 'started_at', 'completed_at',
            'duration_seconds', 'model', 'error_message'
        ]
        read_only_fields = ['id', 'started_at']


class StartTrainingSerializer(serializers.Serializer):
    """Serializer para iniciar un trabajo de entrenamiento"""
    model_type = serializers.ChoiceField(choices=['ETA', 'TRAFFIC', 'ANOMALY'])
    use_latest_data = serializers.BooleanField(default=True)
    hyperparameters = serializers.JSONField(required=False, default=dict)


class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = [
            'id', 'prediction_type', 'input_data', 'prediction_result',
            'confidence', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MakePredictionSerializer(serializers.Serializer):
    """Serializer para hacer predicciones"""
    prediction_type = serializers.ChoiceField(
        choices=['ETA_ARRIVAL', 'ROUTE_CONGESTION', 'ANOMALY_DETECTION']
    )
    input_data = serializers.JSONField()


class ModelMetricsSerializer(serializers.ModelSerializer):
    model = MLModelSerializer(read_only=True)

    class Meta:
        model = ModelMetrics
        fields = [
            'id', 'model', 'total_predictions_24h', 'avg_confidence_24h',
            'error_rate_24h', 'total_predictions_7d', 'avg_confidence_7d',
            'error_rate_7d', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class DatasetVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetVersion
        fields = [
            'id', 'model_type', 'version', 'row_count', 'date_range_start',
            'date_range_end', 'created_at', 'used_for_training'
        ]
        read_only_fields = ['id', 'created_at']


class ModelStatusSerializer(serializers.Serializer):
    """Respuesta de estado de un modelo"""
    model_type = serializers.CharField()
    version = serializers.CharField()
    is_active = serializers.BooleanField()
    accuracy = serializers.FloatField()
    last_trained = serializers.DateTimeField()
    predictions_24h = serializers.IntegerField()
    avg_confidence = serializers.FloatField()
