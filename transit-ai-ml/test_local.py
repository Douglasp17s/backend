#!/usr/bin/env python
"""
Tests locales sin BD real
Verificar que los modelos y la lógica funciona
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
from django.conf import settings

print("🧪 Running Local Tests...\n")

# Test 1: Models can be generated
print("Test 1: Generating models...")
try:
    os.makedirs(settings.MODELS_DIR, exist_ok=True)

    # ETA
    X = np.random.uniform([[1, 15, 0, 0.5], [50, 60, 23, 1.5]], size=(50, 4))
    y = np.random.uniform(5, 180, 50)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestRegressor(n_estimators=10, max_depth=5, random_state=42)
    model.fit(X_scaled, y)

    joblib.dump(model, settings.MODELS_DIR / 'test_model.pkl')
    assert (settings.MODELS_DIR / 'test_model.pkl').exists()

    print("  ✓ Model generation works")
except Exception as e:
    print(f"  ✗ Failed: {e}")
    sys.exit(1)

# Test 2: Models can be loaded
print("\nTest 2: Loading models...")
try:
    loaded_model = joblib.load(settings.MODELS_DIR / 'test_model.pkl')
    X_test = np.array([[10, 30, 14, 1.0]])
    X_test_scaled = scaler.transform(X_test)
    prediction = loaded_model.predict(X_test_scaled)

    assert isinstance(prediction[0], (float, np.floating))
    print(f"  ✓ Model loading works (prediction: {prediction[0]:.2f})")
except Exception as e:
    print(f"  ✗ Failed: {e}")
    sys.exit(1)

# Test 3: Anomaly detection works
print("\nTest 3: Anomaly detection...")
try:
    X_anom = np.random.uniform([[0, -5, 0, 0], [80, 5, 50, 1000]], size=(50, 4))

    scaler_anom = StandardScaler()
    X_anom_scaled = scaler_anom.fit_transform(X_anom)

    model_anom = IsolationForest(contamination=0.1, random_state=42)
    model_anom.fit(X_anom_scaled)

    X_test = np.array([[5, 0, 5, 100]])
    X_test_scaled = scaler_anom.transform(X_test)
    prediction = model_anom.predict(X_test_scaled)

    assert prediction[0] in [-1, 1]
    print(f"  ✓ Anomaly detection works (normal={prediction[0]==1})")
except Exception as e:
    print(f"  ✗ Failed: {e}")
    sys.exit(1)

# Test 4: Views can be imported
print("\nTest 4: Importing views...")
try:
    from ml_api.views import PredictionViewSet
    print("  ✓ Views import successfully")
except Exception as e:
    print(f"  ✗ Failed: {e}")
    sys.exit(1)

# Test 5: Models can be imported
print("\nTest 5: Importing models...")
try:
    from ml_api.models import MLModel, Prediction, TrainingJob
    print("  ✓ Models import successfully")
except Exception as e:
    print(f"  ✗ Failed: {e}")
    sys.exit(1)

print("\n✅ All local tests passed!")
print("\nNext steps:")
print("  1. python manage.py migrate")
print("  2. python manage.py generate_models")
print("  3. python manage.py runserver")
