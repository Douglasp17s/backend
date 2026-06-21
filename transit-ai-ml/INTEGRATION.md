# Integración Django ML Service ↔ NestJS Backend

## 🔗 Arquitectura

```
┌─────────────────────────────────┐
│     Cliente (Flutter/React)     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│    NestJS Backend (4000)        │
│  GET /ia/eta/viaje/:id          │
└──────────────┬──────────────────┘
               │ HTTP
               ▼
┌─────────────────────────────────┐
│  Django ML Service (8000)       │
│  POST /api/predictions/predict/ │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   sklearn Models (Local)        │
│   - eta_model.pkl              │
│   - traffic_model.pkl          │
│   - anomaly_model.pkl          │
└─────────────────────────────────┘
```

## 📊 Base de Datos Compartida

**Misma PostgreSQL para ambos servicios**:

```env
# NestJS (.env)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transit_ai

# Django (.env)
DB_NAME=transit_ai
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

### Tablas utilizadas:

**Por NestJS (Prisma)**:
- User, Driver, Passenger
- Trip, Assignment, Route
- DriverLocation, TrafficCondition
- UserPreference
- Incident, Desvio

**Por Django (Django ORM)**:
- ml_api.MLModel
- ml_api.TrainingJob
- ml_api.Prediction
- ml_api.ModelMetrics
- ml_api.DatasetVersion

**Sin conflictos**: Django usa prefijo `ml_api_` en todas sus tablas.

## 🔄 Flujo: Cliente → NestJS → Django

### 1. Cliente solicita predicción (Flutter/React)

```json
GET /ia/eta/viaje/trip-123?lat=10.5&lng=-66.2
```

### 2. NestJS recibe y forwardea a Django

**Archivo: `src/ia/ia.controller.ts`**
```typescript
@Get('eta/viaje/:viajeId')
async predecirETAViaje(@Param('viajeId') viajeId: string) {
  return this.iaService.proxyToDjango('POST', '/predictions/predict/', {
    prediction_type: 'ETA_ARRIVAL',
    input_data: { distance_km: 10, speed_kmh: 30, ... }
  });
}
```

### 3. Django hace predicción con modelos locales

**Archivo: `ml_api/views.py`**
```python
def _predict_eta(self, input_data):
    model = joblib.load('ml_models/eta_model.pkl')
    scaler = joblib.load('ml_models/eta_scaler.pkl')
    X_scaled = scaler.transform(...)
    eta_minutes = model.predict(X_scaled)[0]
    return { 'eta_minutes': eta_minutes, 'confidence': 0.85 }
```

### 4. Respuesta regresa a cliente

```json
{
  "ok": true,
  "data": {
    "prediction_id": "pred-123",
    "result": { "eta_minutes": 25 },
    "confidence": 0.85
  }
}
```

## 📥 Datos de Entrenamiento: NestJS → Django

Django puede leer datos históricos de NestJS para entrenar modelos:

**NestJS expone datos**:
```typescript
// src/ia/ia.controller.ts
@Get('training-data/eta')
async getETATrainingData() {
  // Retorna últimos 500 viajes completados
}
```

**Django obtiene datos**:
```python
# ml_api/trainers.py
def fetch_training_data(self):
    url = f"{settings.NESTJS_BACKEND_URL}/ia/training-data/eta"
    response = requests.get(url)  # Trae viajes reales
    return response.json()['data']
```

## 🚀 Setup Integrado

### Paso 1: NestJS Backend

```bash
cd transit-ai-backend
npm install
cp .env.example .env

# Configurar para servir datos de entrenamiento
# El módulo /ia mantiene:
# - POST /ia/entrenar (manual)
# - GET /ia/training-data/* (para Django)
# - GET /ia/preferencias/* (compatibilidad)
# - Todos los endpoints forwardean a Django via proxy

npm run start:dev
# Escucha en 4000
```

### Paso 2: Django ML Service

```bash
cd transit-ai-ml
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env

# Generar modelos pre-entrenados (local, sin internet)
python manage.py generate_models

# Migraciones (crea tablas ml_api_*)
python manage.py migrate

python manage.py runserver 8000
# Escucha en 8000
```

### Paso 3: Verificar Integración

```bash
# 1. Django genera modelos
curl http://localhost:8000/api/models/

# 2. NestJS expone datos
curl http://localhost:4000/ia/training-data/eta

# 3. NestJS forwardea predicción a Django
curl -X POST http://localhost:4000/ia/eta/viaje/trip-123 \
  -H "Content-Type: application/json"

# 4. Django retorna predicción
# {
#   "ok": true,
#   "data": { "prediction_id": "...", "result": {...} }
# }
```

## 🔧 Variables de Entorno

### Django `.env`

```env
# BD compartida con NestJS
DB_NAME=transit_ai
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# URL de NestJS backend (para obtener datos)
NESTJS_BACKEND_URL=http://localhost:4000

# Redis (opcional, para Celery)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### NestJS `.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transit_ai

# URL de Django ML Service
ML_SERVICE_URL=http://localhost:8000/api
```

## 🎯 Casos de Uso

### 1. Usuario pide ETA (sin internet)

```
Usuario → Flutter
  ↓
NestJS /ia/eta/viaje/:id
  ↓
Django /api/predictions/predict/
  ↓
sklearn Model (local .pkl)
  ↓
Respuesta ETA en minutos
```

### 2. Entrenar nuevo modelo (con datos históricos)

**Opción A: Manual desde Django Admin**
```
Admin → http://localhost:8000/admin/
  ↓
Botón "Train ETA Model"
  ↓
Celery Worker obtiene datos de NestJS
  ↓
Entrena con scikit-learn
  ↓
Guarda modelo en ml_models/
```

**Opción B: Automático cada madrugada**
```
Celery Beat (4:00 AM)
  ↓
train_eta_model_task.delay()
  ↓
Obtiene datos de NestJS
  ↓
Entrena y guarda
```

### 3. Monitoreo de predicciones

```
Django Admin → Prediction list
  ↓
Ver todas las predicciones + confianza
  ↓
Estadísticas por tipo
  ↓
Detectar baja confianza
```

## 🔒 Seguridad

- **Sin internet**: Modelos local, se funciona offline
- **BD compartida**: Mismo usuario/password (ambos internos)
- **CORS**: Django permite solo localhost y NestJS
- **Validación**: DRF valida inputs automáticamente

## 📈 Escalabilidad

**Agregando workers**:
```bash
# Terminal extra
celery -A config worker -l info -c 4
```

**Con Docker**:
```bash
docker-compose up -d
# Incluye: web, worker, beat, db, redis
```

## 🐛 Troubleshooting

### Django no conecta a BD

```bash
# Verificar PostgreSQL escucha
psql -U postgres -h localhost -d transit_ai

# Verificar variables de entorno
cat .env | grep DB_
```

### NestJS no puede llamar a Django

```bash
# Verificar Django está corriendo
curl http://localhost:8000/api/models/

# Verificar URL en NestJS
env | grep ML_SERVICE_URL
```

### Modelos no existen

```bash
# Generar modelos
python manage.py generate_models

# Verificar
ls ml_models/
```

## 📚 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `django/.env` | Variables (BD, NestJS URL) |
| `django/ml_api/views.py` | API endpoints (predicciones) |
| `django/ml_api/trainers.py` | Lógica de entrenamiento |
| `django/ml_models/*.pkl` | Modelos (generados localmente) |
| `nestjs/src/ia/ia.service.ts` | Proxy a Django |
| `nestjs/src/ia/ia.controller.ts` | Endpoints (forwardean) |

## ✅ Checklist de Setup

- [ ] NestJS backend corriendo en 4000
- [ ] Django ML Service corriendo en 8000
- [ ] PostgreSQL accesible desde ambos
- [ ] Modelos generados: `python manage.py generate_models`
- [ ] NESTJS_BACKEND_URL configurado en Django .env
- [ ] Prueba: `curl http://localhost:8000/api/models/`
- [ ] Prueba: `curl http://localhost:4000/ia/status`
