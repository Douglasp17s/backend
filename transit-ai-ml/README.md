# Transit AI - ML Service

Microservicio de Machine Learning para Transit AI, construido con Django, DRF y scikit-learn.
**100% Local** - Modelos pre-entrenados, sin dependencias externas.

## 🎯 Características

- **Modelos de ML Offline**: ETA, Detección de Tráfico, Detección de Anomalías
- **Sin Internet**: Modelos pre-entrenados descargables
- **Entrenamiento Asincrónico**: Celery + Redis (opcional)
- **API REST**: Proxy a Django desde NestJS
- **BD Compartida**: Misma PostgreSQL que NestJS backend
- **Auditoría Completa**: Todas las predicciones registradas

## 📋 Requisitos

- Python 3.11+
- PostgreSQL 13+
- Redis 7+
- Docker y Docker Compose (opcional)

## 🚀 Configuración Local (Mínimo)

### ⚡ Quick Start (5 minutos)

```bash
# 1. Setup
cd transit-ai-ml
python -m venv venv
venv\Scripts\activate  # Windows

# 2. Instalar solo lo esencial
pip install django==4.2.0 djangorestframework==3.14.0 psycopg2-binary scikit-learn joblib

# 3. Variables
copy .env.example .env
# ⚠️  Cambiar: DB_NAME=transit_ai (misma que NestJS)

# 4. Generar modelos locales
python manage.py generate_models

# 5. Ejecutar
python manage.py runserver 8000
```

### 📊 Configuración Completa (con Celery)

```bash
# 1. Virtual env
python -m venv venv
venv\Scripts\activate

# 2. Todas las dependencias
pip install -r requirements.txt

# 3. Variables
copy .env.example .env

# 4. BD (misma que NestJS)
python manage.py migrate

# 5. Superuser
python manage.py createsuperuser

# 6. Generar modelos
python manage.py generate_models

# 7. Ejecutar (3 terminales)
# Terminal 1: Django server
python manage.py runserver 8000

# Terminal 2: Celery worker
celery -A config worker -l info

# Terminal 3: Celery beat (scheduler)
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

## 🔌 Integración con NestJS Backend

Django ML Service actúa como **microservicio independiente**:

```
Cliente (Flutter/React)
    ↓
NestJS Backend (Puerto 4000)
    ↓ GET /ia/eta/viaje/:id
Django ML Service (Puerto 8000)
    ↓
sklearn models (local, sin internet)
```

**Archivo: NestJS `/src/ia/ia.service.ts`**
```typescript
// NestJS llama a Django
async proxyToDjango(endpoint: string, data: any) {
  const response = await axios.post(
    'http://localhost:8000/api/predictions/predict/',
    data
  );
  return response.data;
}
```

**Base de datos compartida**:
- NestJS: `transit_ai` (Prisma)
- Django: `transit_ai` (misma BD)
- Django puede leer datos de NestJS para entrenar modelos

## 🐳 Con Docker (Opcional)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec web python manage.py migrate

# Generar modelos
docker-compose exec web python manage.py generate_models

# Crear superuser
docker-compose exec web python manage.py createsuperuser

# Ver logs
docker-compose logs -f web
```

## 📚 API Endpoints

### Modelos

```bash
# Obtener todos los modelos
GET /api/models/

# Obtener modelos activos
GET /api/models/active/

# Obtener estado de un modelo
GET /api/models/{id}/status/
```

### Entrenar Modelos

```bash
# Iniciar entrenamiento
POST /api/training-jobs/start_training/
{
  "model_type": "ETA",
  "use_latest_data": true,
  "hyperparameters": {"n_estimators": 100}
}

# Ver trabajos de entrenamiento
GET /api/training-jobs/

# Ver trabajos por tipo
GET /api/training-jobs/by_model_type/?model_type=ETA
```

### Predicciones

```bash
# Hacer predicción ETA
POST /api/predictions/predict/
{
  "prediction_type": "ETA_ARRIVAL",
  "input_data": {
    "distance_km": 10,
    "speed_kmh": 30,
    "hour_of_day": 14,
    "traffic_factor": 1.2
  }
}

# Hacer predicción de tráfico
POST /api/predictions/predict/
{
  "prediction_type": "ROUTE_CONGESTION",
  "input_data": {
    "speed_kmh": 25,
    "vehicle_count": 150,
    "hour_of_day": 8,
    "day_of_week": 1
  }
}

# Hacer predicción de anomalía
POST /api/predictions/predict/
{
  "prediction_type": "ANOMALY_DETECTION",
  "input_data": {
    "speed_kmh": 5,
    "acceleration_mss": -3.5,
    "stops_count": 15,
    "route_deviation_meters": 800
  }
}

# Obtener estadísticas
GET /api/predictions/stats/

# Listar predicciones recientes
GET /api/predictions/
```

## 🔄 Tareas Programadas

Celery Beat ejecuta automáticamente:

- **02:00 AM** - Entrenar modelo ETA
- **03:00 AM** - Entrenar modelo de Tráfico
- **04:00 AM** - Entrenar modelo de Anomalías
- **05:00 AM** - Limpiar predicciones expiradas

## 📊 Estructura de Datos

### MLModel
```
id: UUID
model_type: ETA | TRAFFIC | ANOMALY
version: string
accuracy, precision, recall, f1_score, rmse, mae, r2_score: float
is_active: bool
trained_at, updated_at: datetime
training_data_size: int
feature_names: array
hyperparameters: json
```

### Prediction
```
id: UUID
prediction_type: ETA_ARRIVAL | ROUTE_CONGESTION | ANOMALY_DETECTION
input_data: json (con hash para caché)
prediction_result: json
confidence: float (0-1)
created_at, expires_at: datetime
actual_value: json (opcional, para validación)
is_correct: bool (opcional)
```

### TrainingJob
```
id: UUID
model_type: ETA | TRAFFIC | ANOMALY
status: PENDING | RUNNING | COMPLETED | FAILED
started_at, completed_at: datetime
duration_seconds: int
model: ForeignKey(MLModel)
error_message: string
logs: text
```

## 🔌 Integración con NestJS Backend

El ML Service se comunica con NestJS mediante HTTP:

```python
# En trainers.py
url = f"{settings.NESTJS_BACKEND_URL}/ia/training-data/eta"
response = requests.get(url)
```

El NestJS backend debe exponer endpoints:
- `GET /ia/training-data/eta` - Datos para entrenar modelo ETA
- `GET /ia/training-data/traffic` - Datos para entrenar modelo de tráfico
- `GET /ia/training-data/anomaly` - Datos para entrenar modelo de anomalías

## 📈 Monitoreo

Acceder a Django Admin:
```
http://localhost:8000/admin/
```

Ver:
- Modelos entrenados y métricas
- Trabajos de entrenamiento (estado, duración, errores)
- Histórico de predicciones
- Estadísticas de desempeño

## 🛠️ Desarrollo

### Crear nuevo modelo

1. Crear clase en `trainers.py`:
```python
class MyModelTrainer:
    def fetch_training_data(self):
        pass
    
    def train(self):
        # Entrenar y guardar
        joblib.dump(self.model, path)
        return metrics
```

2. Crear tarea en `tasks.py`:
```python
@shared_task
def train_my_model_task(self):
    trainer = MyModelTrainer()
    metrics = trainer.train()
    # Guardar en BD
```

3. Agregar endpoint en `views.py`

### Tests

```bash
python manage.py test ml_api
```

## 🚨 Troubleshooting

**Redis no conecta**:
```bash
redis-cli ping  # Debe responder PONG
```

**BD no migra**:
```bash
python manage.py migrate --fake ml_api zero  # Reset
python manage.py migrate
```

**Workers no ejecutan tareas**:
```bash
celery -A config worker -l debug  # Ver logs detallados
```

## 📝 Licencia

Parte del proyecto Transit AI
