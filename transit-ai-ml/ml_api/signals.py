"""
Django signals para ML API
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MLModel, ModelMetrics


@receiver(post_save, sender=MLModel)
def create_model_metrics(sender, instance, created, **kwargs):
    """Crea métricas cuando se crea un nuevo modelo"""
    if created:
        ModelMetrics.objects.get_or_create(model=instance)
