"""
Django management command para generar modelos pre-entrenados
Uso: python manage.py generate_models
"""

from django.core.management.base import BaseCommand
from django.conf import settings
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os


class Command(BaseCommand):
    help = 'Generate pre-trained ML models for local use'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔄 Generating pre-trained models...'))

        os.makedirs(settings.MODELS_DIR, exist_ok=True)

        # ETA Model
        self.stdout.write('  1. ETA Model...')
        np.random.seed(42)

        X_eta = np.random.uniform(1, 50, (500, 1))
        X_eta = np.hstack([
            X_eta,
            np.random.uniform(15, 60, (500, 1)),
            np.random.uniform(0, 24, (500, 1)),
            np.random.uniform(0.5, 1.5, (500, 1))
        ])

        y_eta = (X_eta[:, 0] / (X_eta[:, 1] * X_eta[:, 3])) * 60
        y_eta = np.clip(y_eta + np.random.normal(0, 2, 500), 5, 180)

        scaler_eta = StandardScaler()
        X_eta_scaled = scaler_eta.fit_transform(X_eta)

        model_eta = RandomForestRegressor(n_estimators=50, max_depth=15, random_state=42, n_jobs=-1)
        model_eta.fit(X_eta_scaled, y_eta)

        joblib.dump(model_eta, settings.MODELS_DIR / 'eta_model.pkl')
        joblib.dump(scaler_eta, settings.MODELS_DIR / 'eta_scaler.pkl')
        self.stdout.write('    ✓ ETA model saved')

        # Traffic Model
        self.stdout.write('  2. Traffic Model...')

        X_traffic = np.hstack([
            np.random.uniform(5, 80, (500, 1)),
            np.random.uniform(0, 500, (500, 1)),
            np.random.uniform(0, 24, (500, 1)),
            np.random.uniform(0, 7, (500, 1))
        ])

        y_traffic = np.where(
            X_traffic[:, 0] < 20, 3,
            np.where(X_traffic[:, 0] < 35, 2, np.where(X_traffic[:, 0] < 50, 1, 0))
        )

        scaler_traffic = StandardScaler()
        X_traffic_scaled = scaler_traffic.fit_transform(X_traffic)

        model_traffic = RandomForestRegressor(n_estimators=50, max_depth=12, random_state=42, n_jobs=-1)
        model_traffic.fit(X_traffic_scaled, y_traffic)

        joblib.dump(model_traffic, settings.MODELS_DIR / 'traffic_model.pkl')
        joblib.dump(scaler_traffic, settings.MODELS_DIR / 'traffic_scaler.pkl')
        self.stdout.write('    ✓ Traffic model saved')

        # Anomaly Model
        self.stdout.write('  3. Anomaly Model...')

        X_anomaly = np.hstack([
            np.random.uniform(0, 80, (500, 1)),
            np.random.uniform(-5, 5, (500, 1)),
            np.random.uniform(0, 50, (500, 1)),
            np.random.uniform(0, 1000, (500, 1))
        ])

        scaler_anomaly = StandardScaler()
        X_anomaly_scaled = scaler_anomaly.fit_transform(X_anomaly)

        model_anomaly = IsolationForest(contamination=0.1, random_state=42, n_jobs=-1)
        model_anomaly.fit(X_anomaly_scaled)

        joblib.dump(model_anomaly, settings.MODELS_DIR / 'anomaly_model.pkl')
        joblib.dump(scaler_anomaly, settings.MODELS_DIR / 'anomaly_scaler.pkl')
        self.stdout.write('    ✓ Anomaly model saved')

        self.stdout.write(self.style.SUCCESS('\n✅ Pre-trained models generated successfully'))
        self.stdout.write(f'   Location: {settings.MODELS_DIR}')
