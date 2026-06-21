"""
Admin configuration para ML API
"""

from django.contrib import admin
from .models import MLModel, TrainingJob, Prediction, ModelMetrics, DatasetVersion


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('model_type', 'version', 'accuracy', 'is_active', 'trained_at')
    list_filter = ('model_type', 'is_active', 'trained_at')
    search_fields = ('model_type', 'version')
    readonly_fields = ('id', 'trained_at', 'updated_at')


@admin.register(TrainingJob)
class TrainingJobAdmin(admin.ModelAdmin):
    list_display = ('model_type', 'status', 'started_at', 'duration_seconds')
    list_filter = ('model_type', 'status', 'started_at')
    readonly_fields = ('id', 'started_at')


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('prediction_type', 'confidence', 'created_at')
    list_filter = ('prediction_type', 'created_at')
    readonly_fields = ('id', 'created_at')


@admin.register(ModelMetrics)
class ModelMetricsAdmin(admin.ModelAdmin):
    list_display = ('model', 'total_predictions_24h', 'avg_confidence_24h', 'updated_at')
    readonly_fields = ('id', 'updated_at')


@admin.register(DatasetVersion)
class DatasetVersionAdmin(admin.ModelAdmin):
    list_display = ('model_type', 'version', 'row_count', 'used_for_training', 'created_at')
    list_filter = ('model_type', 'used_for_training', 'created_at')
