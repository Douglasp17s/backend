# Módulos Nuevos - Transit AI Backend

## 1. Billetera Module (`/billetera`)

### Descripción
Gestiona las billeteras virtuales de los usuarios, recargos de saldo y pagos de pasajes.

### Endpoints

#### GET `/billetera/saldo`
Obtiene el saldo actual de la billetera del usuario.

**Response:**
```json
{
  "id": "wallet-123",
  "saldoBs": 50.00,
  "saldoUSD": 7.18,
  "usuario": {
    "nombre": "Juan Pérez",
    "correo": "juan@example.com"
  },
  "ultimaActualizacion": "2024-06-17T10:30:00Z"
}
```

#### POST `/billetera/recargar`
Recarga saldo a la billetera.

**Body:**
```json
{
  "monto": 100.00
}
```

**Response:**
```json
{
  "ok": true,
  "saldoBs": 150.00,
  "saldoUSD": 21.55,
  "montoCargado": 100.00
}
```

#### POST `/billetera/pagar`
Procesa un pago de pasaje.

**Body:**
```json
{
  "lineaId": "linea-123",
  "montoBs": 2.50
}
```

**Response:**
```json
{
  "ok": true,
  "saldoRestante": 147.50,
  "montoDescontado": 2.50,
  "lineaId": "linea-123"
}
```

#### GET `/billetera/historial`
Obtiene el historial de transacciones (últimas 20).

**Response:**
```json
[
  {
    "id": "txn-123",
    "tipo": "PAGO",
    "montoBs": 2.50,
    "montoUSD": 0.36,
    "estado": "COMPLETADA",
    "descripcion": "Pago de pasaje - Línea 100",
    "referencia": "PAGO-1718616600000",
    "createdAt": "2024-06-17T10:30:00Z"
  }
]
```

### Servicios

- **BilleteraService**: Lógica de negocio para billeteras
  - `obtenerSaldo(usuarioId)`: Consulta saldo
  - `recargar(usuarioId, dto)`: Procesa recarga
  - `pagar(usuarioId, dto)`: Procesa pago de pasaje
  - `obtenerHistorial(usuarioId, limite)`: Historial de transacciones

---

## 2. IA Module (`/ia`)

### Descripción
Proporciona predicciones y análisis usando modelos ML simulados. Incluye cálculos de ETA, predicción de tráfico, recomendaciones de horarios y detección de anomalías.

### Endpoints

#### GET `/ia/eta?lineaId=X&lat=Y&lng=Z`
Calcula el tiempo estimado de llegada (ETA).

**Response:**
```json
{
  "lineaId": "linea-100",
  "eta": 12,
  "unidad": "minutos",
  "confianza": 0.89,
  "factorTrafico": 1.2,
  "timestamp": "2024-06-17T10:30:00Z"
}
```

#### GET `/ia/trafico?lineaId=X`
Predice condiciones de tráfico en una línea.

**Response:**
```json
{
  "lineaId": "linea-100",
  "nivelCongestión": "MODERADO",
  "porcentajeCongestión": 45,
  "velocidadPromedio": 22.5,
  "recomendacion": "Tráfico normal, viaja con confianza",
  "timestamp": "2024-06-17T10:30:00Z"
}
```

#### GET `/ia/horario?lineaId=X`
Recomienda el mejor horario para viajar.

**Response:**
```json
{
  "lineaId": "linea-100",
  "horaActual": 14,
  "horarioOptimo": 14,
  "razon": "Después del almuerzo, tráfico bajo",
  "minutosDeEspera": 0
}
```

#### GET `/ia/anomalias?lineaId=X`
Detecta anomalías en el sistema.

**Response:**
```json
{
  "anomalias": [
    {
      "tipo": "DESVIO",
      "lineaId": "linea-100",
      "descripcion": "Desvío debido a mantenimiento de calle",
      "impactoEta": 10,
      "duracionEstimada": 60
    }
  ],
  "cantidad": 1,
  "timestamp": "2024-06-17T10:30:00Z"
}
```

#### GET `/ia/predicciones?lineaId=X&lat=Y&lng=Z`
Obtiene todas las predicciones agregadas.

**Response:**
```json
{
  "lineaId": "linea-100",
  "ubicacion": { "lat": -17.8, "lng": -63.18 },
  "eta": { "lineaId": "linea-100", "eta": 12, "unidad": "minutos", ... },
  "trafico": { "nivelCongestión": "MODERADO", ... },
  "horario": { "horarioOptimo": 14, ... },
  "anomalias": { "anomalias": [], "cantidad": 0 },
  "generadoEn": "2024-06-17T10:30:00Z"
}
```

### Servicios

- **IaService**: Análisis y predicciones
  - `calcularEta(dto)`: Calcula ETA para línea
  - `predecirTrafico(lineaId)`: Predice condiciones de tráfico
  - `recomendarHorario(lineaId)`: Recomienda mejor hora
  - `detectarAnomalias(lineaId?)`: Detecta anomalías
  - `obtenerPredicciones(lineaId, lat, lng)`: Agregado de predicciones

---

## Autenticación

Todos los endpoints requieren JWT Bearer token:

```
Authorization: Bearer <token>
```

Los tokens se obtienen en `/auth/login`.

---

## Integración con Frontends

### Frontend Next.js

```typescript
// Servicios disponibles
import { iaServicio } from '@/services/ia.servicio';
import { billeteraServicio } from '@/services/billetera.servicio';

// Obtener ETA
const eta = await iaServicio.obtenerETA(lineaId, lat, lng);

// Obtener tráfico
const trafico = await iaServicio.obtenerTraficoEnRuta(lineaId);

// Pagar pasaje
const resultado = await billeteraServicio.pagar({ lineaId });

// Recargar billetera
const recarga = await billeteraServicio.recargar({ monto: 100 });
```

### Flutter Apps

```dart
// Llamadas HTTP directo o mediante Dio
final response = await dio.get(
  '/ia/eta',
  queryParameters: {
    'lineaId': 'linea-100',
    'lat': -17.8,
    'lng': -63.18,
  },
);
```

---

## Variables de Entorno

```env
# Backend
NEXT_PUBLIC_API_URL=http://localhost:4000
DATABASE_URL=postgresql://user:pass@localhost:5432/transit_ai
JWT_SECRET=tu-secret-aleatorio
```

---

**Última actualización:** 2024-06-17
**Versión:** 1.0
