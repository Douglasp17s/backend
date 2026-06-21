"""
Lógica de entrenamiento para modelos de ML
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import logging
from datetime import datetime, timedelta
from django.conf import settings
import requests

logger = logging.getLogger(__name__)


class ETAModelTrainer:
    """Entrena modelo para predecir ETA"""

    def __init__(self):
        self.model = None
        self.scaler = None

    def fetch_training_data(self):
        """Obtiene datos de entrenamiento desde el backend NestJS"""
        try:
            # Llamar endpoint del backend NestJS para obtener datos de viajes
            url = f"{settings.NESTJS_BACKEND_URL}/ia/training-data/eta"
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            data = response.json()
            if not data.get('ok'):
                raise Exception(f"Backend error: {data.get('error')}")

            return data.get('data', [])
        except Exception as e:
            logger.error(f"Error fetching ETA training data: {e}")
            return self._generate_synthetic_data()

    def _generate_synthetic_data(self):
        """Genera datos sintéticos para demostración"""
        np.random.seed(42)
        n_samples = 500

        distances = np.random.uniform(1, 50, n_samples)
        speeds = np.random.uniform(15, 60, n_samples)
        hour_of_day = np.random.uniform(0, 24, n_samples)
        traffic_factor = np.random.uniform(0.5, 1.5, n_samples)

        etas = (distances / (speeds * traffic_factor)) * 60
        etas = etas + np.random.normal(0, 2, n_samples)
        etas = np.clip(etas, 5, 180)

        return [
            {
                'distance_km': float(d),
                'speed_kmh': float(s),
                'hour_of_day': float(h),
                'traffic_factor': float(t),
                'eta_minutes': float(e)
            }
            for d, s, h, t, e in zip(distances, speeds, hour_of_day, traffic_factor, etas)
        ]

    def train(self):
        """Entrena el modelo ETA"""
        try:
            logger.info("Iniciando entrenamiento de modelo ETA...")

            # Obtener datos
            data = self.fetch_training_data()
            if not data:
                raise Exception("No training data available")

            df = pd.DataFrame(data)

            # Features y target
            features = ['distance_km', 'speed_kmh', 'hour_of_day', 'traffic_factor']
            X = df[features].values
            y = df['eta_minutes'].values

            # Split datos
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Normalizar
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)

            # Entrenar
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=20,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1,
                verbose=1
            )
            self.model.fit(X_train_scaled, y_train)

            # Evaluar
            y_pred = self.model.predict(X_test_scaled)
            metrics = {
                'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
                'mae': float(mean_absolute_error(y_test, y_pred)),
                'r2': float(r2_score(y_test, y_pred))
            }

            # Guardar modelo
            model_path = settings.MODELS_DIR / 'eta_model.pkl'
            scaler_path = settings.MODELS_DIR / 'eta_scaler.pkl'
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)

            logger.info(f"Modelo ETA entrenado exitosamente: {metrics}")
            return metrics

        except Exception as e:
            logger.error(f"Error training ETA model: {e}")
            raise


class TrafficModelTrainer:
    """Entrena modelo para detección de tráfico"""

    def __init__(self):
        self.model = None
        self.scaler = None

    def fetch_training_data(self):
        """Obtiene datos de entrenamiento desde NestJS"""
        try:
            url = f"{settings.NESTJS_BACKEND_URL}/ia/training-data/traffic"
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            data = response.json()
            if not data.get('ok'):
                raise Exception(f"Backend error: {data.get('error')}")

            return data.get('data', [])
        except Exception as e:
            logger.error(f"Error fetching traffic training data: {e}")
            return self._generate_synthetic_data()

    def _generate_synthetic_data(self):
        """Genera datos sintéticos"""
        np.random.seed(42)
        n_samples = 500

        speeds = np.random.uniform(5, 80, n_samples)
        vehicle_count = np.random.uniform(0, 500, n_samples)
        hour = np.random.uniform(0, 24, n_samples)
        day_of_week = np.random.uniform(0, 7, n_samples)

        # Congestion level: 0=bajo, 1=moderado, 2=alto, 3=crítico
        congestion = np.where(
            speeds < 20, 3,
            np.where(speeds < 35, 2, np.where(speeds < 50, 1, 0))
        )

        return [
            {
                'speed_kmh': float(s),
                'vehicle_count': float(v),
                'hour_of_day': float(h),
                'day_of_week': float(d),
                'congestion_level': int(c)
            }
            for s, v, h, d, c in zip(speeds, vehicle_count, hour, day_of_week, congestion)
        ]

    def train(self):
        """Entrena modelo de tráfico"""
        try:
            logger.info("Iniciando entrenamiento de modelo de tráfico...")

            data = self.fetch_training_data()
            if not data:
                raise Exception("No training data available")

            df = pd.DataFrame(data)

            features = ['speed_kmh', 'vehicle_count', 'hour_of_day', 'day_of_week']
            X = df[features].values
            y = df['congestion_level'].values

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)

            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            )
            self.model.fit(X_train_scaled, y_train)

            y_pred = self.model.predict(X_test_scaled)
            metrics = {
                'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
                'mae': float(mean_absolute_error(y_test, y_pred)),
                'r2': float(r2_score(y_test, y_pred))
            }

            model_path = settings.MODELS_DIR / 'traffic_model.pkl'
            scaler_path = settings.MODELS_DIR / 'traffic_scaler.pkl'
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)

            logger.info(f"Modelo de tráfico entrenado: {metrics}")
            return metrics

        except Exception as e:
            logger.error(f"Error training traffic model: {e}")
            raise


class AnomalyModelTrainer:
    """Entrena modelo para detección de anomalías"""

    def __init__(self):
        self.model = None
        self.scaler = None

    def fetch_training_data(self):
        """Obtiene datos de entrenamiento"""
        try:
            url = f"{settings.NESTJS_BACKEND_URL}/ia/training-data/anomaly"
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            data = response.json()
            if not data.get('ok'):
                raise Exception(f"Backend error: {data.get('error')}")

            return data.get('data', [])
        except Exception as e:
            logger.error(f"Error fetching anomaly training data: {e}")
            return self._generate_synthetic_data()

    def _generate_synthetic_data(self):
        """Genera datos sintéticos"""
        np.random.seed(42)
        n_samples = 500

        speed = np.random.uniform(0, 80, n_samples)
        acceleration = np.random.uniform(-5, 5, n_samples)
        stops_count = np.random.uniform(0, 50, n_samples)
        route_deviation = np.random.uniform(0, 1000, n_samples)

        # Anomalía si: velocidad muy baja, aceleración rara, muchos stops, desviación
        is_anomaly = (
            ((speed < 5) & (stops_count > 10)) |
            ((np.abs(acceleration) > 4)) |
            ((route_deviation > 500))
        ).astype(int)

        return [
            {
                'speed_kmh': float(s),
                'acceleration_mss': float(a),
                'stops_count': float(st),
                'route_deviation_meters': float(rd),
                'is_anomaly': int(ano)
            }
            for s, a, st, rd, ano in zip(speed, acceleration, stops_count, route_deviation, is_anomaly)
        ]

    def train(self):
        """Entrena modelo de anomalías"""
        try:
            logger.info("Iniciando entrenamiento de modelo de anomalías...")

            data = self.fetch_training_data()
            if not data:
                raise Exception("No training data available")

            df = pd.DataFrame(data)

            features = ['speed_kmh', 'acceleration_mss', 'stops_count', 'route_deviation_meters']
            X = df[features].values

            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)

            # Isolation Forest para detección de anomalías
            self.model = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_jobs=-1
            )
            y_pred = self.model.fit_predict(X_scaled)

            # Calcular métrica de anomalías detectadas
            anomaly_count = np.sum(y_pred == -1)
            anomaly_ratio = anomaly_count / len(y_pred)

            metrics = {
                'anomalies_detected': int(anomaly_count),
                'anomaly_ratio': float(anomaly_ratio),
                'total_samples': len(X)
            }

            model_path = settings.MODELS_DIR / 'anomaly_model.pkl'
            scaler_path = settings.MODELS_DIR / 'anomaly_scaler.pkl'
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)

            logger.info(f"Modelo de anomalías entrenado: {metrics}")
            return metrics

        except Exception as e:
            logger.error(f"Error training anomaly model: {e}")
            raise
