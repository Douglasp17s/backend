"""
Celery config for Transit AI ML Service
"""

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('transit_ai_ml')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Configurar tareas periódicas
app.conf.beat_schedule = {
    'train-eta-model-daily': {
        'task': 'ml_api.tasks.train_eta_model_task',
        'schedule': crontab(hour=2, minute=0),  # 2am diarios
    },
    'train-traffic-model-daily': {
        'task': 'ml_api.tasks.train_traffic_model_task',
        'schedule': crontab(hour=3, minute=0),  # 3am diarios
    },
    'train-anomaly-model-daily': {
        'task': 'ml_api.tasks.train_anomaly_model_task',
        'schedule': crontab(hour=4, minute=0),  # 4am diarios
    },
    'cleanup-old-predictions': {
        'task': 'ml_api.tasks.cleanup_old_predictions',
        'schedule': crontab(hour=5, minute=0),  # 5am diarios
    },
}
