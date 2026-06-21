"""
Script para generar modelos pre-entrenados locales
Ejecutar: python manage.py shell < ml_api/generate_models.py
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from django.conf import settings

def generate_models():
    """Genera 3 modelos pre-entrenados"""

    os.makedirs(settings.MODELS_DIR, exist_ok=True)

    print("🔄 Generando modelos pre-entrenados...")

    # ════════════════════════════════════════════════════════════════
    # Modelo ETA
    # ════════════════════════════════════════════════════════════════
    print("  1. ETA Model...")
    np.random.seed(42)

    X_eta = np.random.uniform(
        [[1, 15, 0, 0.5],
         [50, 60, 23, 1.5]],
        size=(500, 4)
    )
    y_eta = (X_eta[:, 0] / (X_eta[:, 1] * X_eta[:, 3])) * 60
    y_eta = np.clip(y_eta + np.random.normal(0, 2, 500), 5, 180)

    scaler_eta = StandardScaler()
    X_eta_scaled = scaler_eta.fit_transform(X_eta)

    model_eta = RandomForestRegressor(n_estimators=50, max_depth=15, random_state=42)
    model_eta.fit(X_eta_scaled, y_eta)

    joblib.dump(model_eta, settings.MODELS_DIR / 'eta_model.pkl')
    joblib.dump(scaler_eta, settings.MODELS_DIR / 'eta_scaler.pkl')
    print("    ✓ ETA model saved")

    # ════════════════════════════════════════════════════════════════
    # Modelo Traffic
    # ════════════════════════════════════════════════════════════════
    print("  2. Traffic Model...")

    X_traffic = np.random.uniform(
        [[5, 0, 0, 0],
         [80, 500, 23, 6]],
        size=(500, 4)
    )
    y_traffic = np.where(
        X_traffic[:, 0] < 20, 3,
        np.where(X_traffic[:, 0] < 35, 2, np.where(X_traffic[:, 0] < 50, 1, 0))
    )

    scaler_traffic = StandardScaler()
    X_traffic_scaled = scaler_traffic.fit_transform(X_traffic)

    model_traffic = RandomForestRegressor(n_estimators=50, max_depth=12, random_state=42)
    model_traffic.fit(X_traffic_scaled, y_traffic)

    joblib.dump(model_traffic, settings.MODELS_DIR / 'traffic_model.pkl')
    joblib.dump(scaler_traffic, settings.MODELS_DIR / 'traffic_scaler.pkl')
    print("    ✓ Traffic model saved")

    # ════════════════════════════════════════════════════════════════
    # Modelo Anomaly
    # ════════════════════════════════════════════════════════════════
    print("  3. Anomaly Model...")

    X_anomaly = np.random.uniform(
        [[0, -5, 0, 0],
         [80, 5, 50, 1000]],
        size=(500, 4)
    )

    scaler_anomaly = StandardScaler()
    X_anomaly_scaled = scaler_anomaly.fit_transform(X_anomaly)

    model_anomaly = IsolationForest(contamination=0.1, random_state=42)
    model_anomaly.fit(X_anomaly_scaled)

    joblib.dump(model_anomaly, settings.MODELS_DIR / 'anomaly_model.pkl')
    joblib.dump(scaler_anomaly, settings.MODELS_DIR / 'anomaly_scaler.pkl')
    print("    ✓ Anomaly model saved")

    print("\n✅ Modelos pre-entrenados generados exitosamente")
    print(f"   Ubicación: {settings.MODELS_DIR}")

if __name__ == '__main__':
    generate_models()
