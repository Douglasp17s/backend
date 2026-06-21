# Arquitectura - Transit AI ML Service

## 📁 Estructura del Proyecto

```
transit-ai-ml/
├── config/                          # Configuración Django
│   ├── settings.py                  # Configuración general
│   ├── urls.py                      # URLs principales
│   ├── wsgi.py                      # WSGI
│   └── celery.py                    # Configuración Celery
│
├── ml_api/                          # App principal de ML
│   ├── models.py                    # Modelos Django (MLModel, TrainingJob, Prediction, etc)
│   ├── views.py                     # ViewSets DRF
│   ├── serializers.py               # Serializers DRF
│   ├── urls.py                      # URLs de la app
│   ├── trainers.py                  # Lógica de entrenamiento (ETAModelTrainer, etc)
│   ├── tasks.py                     # Tareas Celery
│   ├── admin.py                     # Admin Django
│   ├── apps.py                      # Configuración app
│   └── signals.py                   # Señales Django
│
├── ml_models/                       # Modelos entrenados (generado)
│   ├── eta_model.pkl
│   ├── traffic_model.pkl
│   └── anomaly_model.pkl
│
├── templates/                       # Templates (si se usan)
├── staticfiles/                     # Static files colectados
├── media/                           # Media files
│
├── manage.py                        # Django CLI
├── requirements.txt                 # Dependencias Python
├── docker-compose.yml               # Docker Compose
├── Dockerfile                       # Docker build
├── .env.example                     # Variables de entorno ejemplo
├── setup.sh                         # Script de setup
├── README.md                        # Documentación
└── ARQUITECTURA.md                  # Este archivo
```

## 🔄 Flujo de Entrenamiento

```
┌─────────────────────────────────────────────────────────────┐
│                    Usuario/API                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         POST /api/training-jobs/start_training/              │
│              (model_type: "ETA", "TRAFFIC", etc)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           TrainingJobViewSet.start_training()                │
│         - Crea TrainingJob (PENDING)                         │
│         - Encola tarea Celery                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Celery Worker (asincrónico)                      │
│         - train_eta_model_task()                             │
│         - train_traffic_model_task()                         │
│         - train_anomaly_model_task()                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Trainer (ETAModelTrainer, etc)                  │
│         1. fetch_training_data()                             │
│            → GET /ia/training-data/eta (NestJS backend)      │
│         2. train()                                           │
│            → Normalizar datos                                │
│            → Entrenar modelo (sklearn)                       │
│            → Calcular métricas                               │
│            → Guardar modelo con joblib                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Guardar en BD                                │
│         - MLModel (modelo entrenado + métricas)              │
│         - TrainingJob (completado/fallido)                   │
│         - Desactivar modelos anteriores                      │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Flujo de Predicción

```
┌──────────────────────────────────────────────────┐
│        Cliente (Frontend/Backend NestJS)          │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│   POST /api/predictions/predict/                 │
│   {                                              │
│     "prediction_type": "ETA_ARRIVAL",            │
│     "input_data": {...}                          │
│   }                                              │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│   PredictionViewSet._make_prediction()           │
│   - Validar tipo de predicción                   │
│   - Cargar modelo con joblib                     │
│   - Normalizar inputs (scaler)                   │
│   - Hacer predicción                             │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│   Guardar en BD (Prediction)                     │
│   - input_data (con hash para caché)             │
│   - prediction_result                            │
│   - confidence                                   │
│   - expires_at (24h)                             │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│   Response                                       │
│   {                                              │
│     "ok": true,                                  │
│     "data": {                                    │
│       "prediction_id": "...",                    │
│       "result": {...},                           │
│       "confidence": 0.85                         │
│     }                                            │
│   }                                              │
└──────────────────────────────────────────────────┘
```

## 🗄️ Modelos Django

### MLModel
Almacena información de modelos entrenados:
- `model_type`: ETA, TRAFFIC, ANOMALY
- `version`: Versión del modelo
- `accuracy, precision, recall, f1_score`: Métricas de clasificación
- `rmse, mae, r2_score`: Métricas de regresión
- `is_active`: Modelo activo (solo 1 por tipo)
- `trained_at`: Cuándo se entrenó
- `hyperparameters`: JSON con configuración
- `feature_names`: Lista de features usadas

### TrainingJob
Registro de trabajos de entrenamiento:
- `status`: PENDING → RUNNING → COMPLETED/FAILED
- `started_at`, `completed_at`: Timestamps
- `duration_seconds`: Tiempo de ejecución
- `error_message`: Si falló
- `logs`: Salida de logs (opcional)
- `model`: Referencia al MLModel creado

### Prediction
Auditoría de predicciones:
- `prediction_type`: ETA_ARRIVAL, ROUTE_CONGESTION, ANOMALY_DETECTION
- `input_data`: JSON con datos de entrada
- `input_hash`: SHA256 para caché/búsqueda
- `prediction_result`: JSON con resultado
- `confidence`: Confianza (0-1)
- `created_at`, `expires_at`: Para limpiar automáticamente
- `actual_value` (opcional): Para validación posterior

### ModelMetrics
Métricas de desempeño en tiempo real:
- `total_predictions_24h`, `total_predictions_7d`: Volumen
- `avg_confidence_24h`, `avg_confidence_7d`: Confianza promedio
- `error_rate_24h`, `error_rate_7d`: Tasa de error

### DatasetVersion
Versionado de datasets:
- Para auditoría de qué datos se usaron en qué entrenamiento
- `date_range_start`, `date_range_end`: Período de datos
- `used_for_training`: Marca si se usó en algún entrenamiento

## 🔌 Integraciones

### NestJS Backend
El ML Service se comunica con NestJS para:

**Obtener datos de entrenamiento**:
```
GET /ia/training-data/eta
GET /ia/training-data/traffic
GET /ia/training-data/anomaly
```

Response esperada:
```json
{
  "ok": true,
  "data": [
    {
      "distance_km": 10,
      "speed_kmh": 30,
      "hour_of_day": 14,
      "traffic_factor": 1.2,
      "eta_minutes": 25
    }
  ]
}
```

### Celery + Redis
- **Broker**: Redis para encolar tareas
- **Backend**: Redis para almacenar resultados
- **Beat**: Scheduler para ejecutar tareas periódicas

```python
# Ejecutar tarea asincrónica
train_eta_model_task.delay()

# Ejecutar en horario (Beat)
@periodic_task(run_every=crontab(hour=2, minute=0))
def train_eta_daily():
    pass
```

## 📊 Dependencias Principales

### scikit-learn
```python
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
```

- **RandomForestRegressor**: Para ETA y Tráfico (regresión)
- **IsolationForest**: Para detección de anomalías (unsupervised)
- **StandardScaler**: Normalizar features
- **train_test_split**: Dividir datos

### Django + DRF
- Modelos ORM
- ViewSets para CRUD
- Serializers para validación
- Permissions y autenticación

### Celery
- Tareas asincrónicas
- Scheduler (Beat) para tareas periódicas
- Retry con exponential backoff

## 🔐 Seguridad

1. **Validación de inputs**: Serializers DRF
2. **Rate limiting**: DRF throttling
3. **CORS**: Configurado para NestJS backend
4. **BD**: Queries parametrizadas (Django ORM)
5. **Secrets**: Variables de entorno (.env)

## 📈 Escalabilidad

### Horizontal
```bash
# Múltiples workers Celery
celery -A config worker -l info -c 4  # 4 concurrencias
celery -A config worker -l info -c 8  # Otro worker con 8
```

### Vertical
```bash
# Aumentar recursos
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_TASK_TIME_LIMIT = 3600  # 1 hora
```

### Cache
```python
# Reutilizar predicciones (24h)
expires_at = timezone.now() + timedelta(hours=24)
```

## 🧪 Testing

```bash
python manage.py test ml_api.tests

# Con coverage
coverage run --source='ml_api' manage.py test
coverage report
```

## 📝 Logging

```python
import logging
logger = logging.getLogger(__name__)

logger.info("Iniciando entrenamiento...")
logger.error(f"Error: {e}")
```

Logs se escriben a:
- Consola (desarrollo)
- BD TrainingJob.logs (auditoría)
- Archivo (producción)

## 🚀 Deployment

### Development
```bash
python manage.py runserver 8000
```

### Production
```bash
# Gunicorn
gunicorn config.wsgi:application --workers 4

# Supervisor (para workers Celery)
[program:celery]
command=celery -A config worker -l info
```

### Docker
```bash
docker-compose -f docker-compose.yml up -d
```

## 🔄 CI/CD

Recomendado:
- Tests automáticos en cada commit
- Linting (flake8, black)
- Type checking (mypy)
- Deploar a staging primero

```yaml
# GitHub Actions ejemplo
- run: python manage.py test
- run: flake8 ml_api
- run: mypy ml_api
```
