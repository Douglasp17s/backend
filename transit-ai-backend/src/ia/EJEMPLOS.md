# Ejemplos de Uso del Módulo IA

Ejemplos prácticos para cada predicción.

## 1. ETA (Estimated Time of Arrival)

### Obtener ETA de un viaje específico

**Request:**
```bash
GET /ia/eta/viaje/42?lat=-17.8047&lng=-63.1899
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "etaMinutos": 12,
    "distanciaMetros": 3200,
    "velocidadKmh": 16.5,
    "fuente": "haversine",
    "factorTraficoPct": 20,
    "detalles": {
      "busId": "15",
      "viajeId": "42",
      "ubicacionActualLat": -17.810,
      "ubicacionActualLng": -63.185
    },
    "confianza": 0.85
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

### Obtener ETA del bus más cercano en una línea

**Request:**
```bash
GET /ia/eta/linea/5?lat=-17.8047&lng=-63.1899
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "etaMinutos": 8,
    "distanciaMetros": 2100,
    "velocidadKmh": 18.0,
    "fuente": "haversine",
    "factorTraficoPct": 10,
    "confianza": 0.90
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

## 2. Predicción de Tráfico

### Analizar congestión en un punto

**Request:**
```bash
GET /ia/congestion?lat=-17.8047&lng=-63.1899&radio=800
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "nivel": "MODERADO",
    "velocidadPromedioKmh": 22.5,
    "busesEnZona": 5,
    "factorDemora": 1.2,
    "descripcion": "Ligera congestión, velocidad reducida",
    "fuente": "flota",
    "confianza": 0.85
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

### Obtener zonas de congestión

**Request:**
```bash
GET /ia/congestion/zonas
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "zonas": [
      {
        "lat": -17.805,
        "lng": -63.188,
        "nivel": "ALTO",
        "velocidadKmh": 15.3,
        "busesDetectados": 8,
        "descripcion": "Congestión significativa"
      },
      {
        "lat": -17.812,
        "lng": -63.195,
        "nivel": "MODERADO",
        "velocidadKmh": 22.0,
        "busesDetectados": 3,
        "descripcion": "Ligera congestión"
      }
    ],
    "total": 2
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

## 3. Recomendación de Horario Óptimo

### Recomendar horario para viajar

**Request:**
```bash
POST /ia/horario/recomendacion
Content-Type: application/json

{
  "lineaId": "5",
  "origenLat": -17.8047,
  "origenLng": -63.1899,
  "destinoLat": -17.7500,
  "destinoLng": -63.1500,
  "criterio": "EQUILIBRIO"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "horariosRecomendados": [
      {
        "hora": "09:30",
        "etaEstimadoMin": 35,
        "nivelCongestio": "BAJO",
        "confianza": 0.92,
        "razon": "Mejor opción"
      },
      {
        "hora": "14:00",
        "etaEstimadoMin": 42,
        "nivelCongestio": "MODERADO",
        "confianza": 0.88,
        "razon": "Alternativa"
      },
      {
        "hora": "19:00",
        "etaEstimadoMin": 58,
        "nivelCongestio": "ALTO",
        "confianza": 0.85,
        "razon": "Alternativa"
      }
    ],
    "horarioOptimo": "09:30",
    "justificacion": "El horario 09:30 ofrece mejor balance entre tiempo y tráfico",
    "ahorroMinutos": 23,
    "confianza": 0.92
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

### Con criterio MENOR_TIEMPO

**Request:**
```bash
POST /ia/horario/recomendacion
Content-Type: application/json

{
  "lineaId": "5",
  "origenLat": -17.8047,
  "origenLng": -63.1899,
  "destinoLat": -17.7500,
  "destinoLng": -63.1500,
  "criterio": "MENOR_TIEMPO"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "horarioOptimo": "08:15",
    "justificacion": "El horario 08:15 tiene el ETA más corto (28 min)",
    "ahorroMinutos": 30,
    "confianza": 0.88
  }
}
```

## 4. Detección de Anomalías en Bus

### Analizar anomalías de un bus (GET)

**Request:**
```bash
GET /ia/anomalias/bus/42?ventana=120
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "busId": "42",
    "tieneAnomalía": true,
    "puntuacionAnomalía": 65,
    "anomaliasDetectadas": [
      {
        "tipo": "VELOCIDAD_BAJA",
        "severidad": "ALTA",
        "descripcion": "Velocidad muy reducida: 8 km/h (histórico: 25 km/h)",
        "recomendacion": "Verificar mecánica del bus o condiciones de tráfico"
      },
      {
        "tipo": "PAUSA_LARGA",
        "severidad": "MEDIA",
        "descripcion": "Pausa sin movimiento: 25 minutos",
        "momento": "2024-06-17T10:15:00Z",
        "recomendacion": "Verificar si hay problema mecánico o del conductor"
      }
    ],
    "metricas": {
      "velocidadPromedio": 18.5,
      "velocidadMaxima": 45,
      "velocidadMinima": 0,
      "tiempoDeDetencion": 45,
      "distanciaRecorrida": 12.3,
      "desvioBrutaCamino": 5.2
    },
    "confianza": 0.88
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

### Análisis detallado (POST)

**Request:**
```bash
POST /ia/anomalias/bus
Content-Type: application/json

{
  "busId": "42",
  "ventanaMinutos": 180,
  "incluirHistorico": true
}
```

**Response:** (similar al anterior, pero con análisis de 3 horas)

## 5. Análisis de Anomalías en Flota

### Analizar toda la flota

**Request:**
```bash
POST /ia/anomalias/flota
Content-Type: application/json

{
  "sindicatoId": "1",
  "lineaId": "5",
  "soloGraves": false
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "busesConAnomalía": 3,
    "totalBusesActivos": 25,
    "porcentajeAnomalías": 12.0,
    "anomaliasDetectadas": [
      {
        "busId": "42",
        "tieneAnomalía": true,
        "puntuacionAnomalía": 65,
        "anomaliasDetectadas": [
          {
            "tipo": "VELOCIDAD_BAJA",
            "severidad": "ALTA",
            "descripcion": "..."
          }
        ],
        "confianza": 0.88
      },
      {
        "busId": "43",
        "tieneAnomalía": true,
        "puntuacionAnomalía": 72,
        "anomaliasDetectadas": [
          {
            "tipo": "DESVÍO_RUTA",
            "severidad": "ALTA",
            "descripcion": "Desvío de ruta detectado: 18% más de distancia",
            "recomendacion": "Revisar ruta tomada y comunicar con el conductor"
          }
        ],
        "confianza": 0.85
      }
    ],
    "alertasCríticas": [
      {
        "busId": "42",
        "tipo": "VELOCIDAD_BAJA",
        "severidad": "ALTA",
        "accion_recomendada": "Verificar mecánica del bus o condiciones de tráfico"
      },
      {
        "busId": "43",
        "tipo": "DESVÍO_RUTA",
        "severidad": "ALTA",
        "accion_recomendada": "Revisar ruta tomada y comunicar con el conductor"
      }
    ],
    "confianza": 0.87
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

## 6. Administración

### Entrenar modelos

**Request:**
```bash
POST /ia/entrenar
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "eta": {
      "velocidadPromedio": 25.3,
      "velocidadDesviacion": 8.5,
      "tiempoPromedioRuta": 42,
      "congestioPromedio": 0.35,
      "aciertosETA": 87,
      "totalPredicciones": 250
    },
    "trafico": {
      "velocidadPromedio": 22.1,
      "velocidadDesviacion": 9.2,
      "tiempoPromedioRuta": 42,
      "congestioPromedio": 0.42,
      "aciertosETA": 78,
      "totalPredicciones": 1500
    },
    "anomalias": {
      "velocidadPromedio": 24.8,
      "velocidadDesviacion": 10.1,
      "tiempoPromedioRuta": 42,
      "congestioPromedio": 0.08,
      "aciertosETA": 5,
      "totalPredicciones": 35
    },
    "timestamp": "2024-06-17T10:35:00Z"
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

### Obtener métricas de un modelo

**Request:**
```bash
GET /ia/metricas/ETA_ARRIVAL
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "tipo": "ETA_ARRIVAL",
    "totalPredicciones": 1250,
    "confianzaPromedio": 0.87,
    "precisionEstimada": "87%"
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

### Limpiar caché expirado

**Request:**
```bash
POST /ia/limpiar-cache
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "eliminadas": 347,
    "timestamp": "2024-06-17T10:35:00Z"
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

### Status del sistema

**Request:**
```bash
GET /ia/status
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "modelos": {
      "eta": {
        "tipo": "ETA_ARRIVAL",
        "totalPredicciones": 1250,
        "confianzaPromedio": 0.87,
        "precisionEstimada": "87%"
      },
      "trafico": {
        "tipo": "ROUTE_CONGESTION",
        "totalPredicciones": 856,
        "confianzaPromedio": 0.82,
        "precisionEstimada": "82%"
      },
      "horario": {
        "tipo": "BEST_TRIP_OPTION",
        "totalPredicciones": 312,
        "confianzaPromedio": 0.85,
        "precisionEstimada": "85%"
      },
      "anomalias": {
        "tipo": "DEMAND_FORECAST",
        "totalPredicciones": 89,
        "confianzaPromedio": 0.78,
        "precisionEstimada": "78%"
      }
    },
    "timestamp": "2024-06-17T10:35:00Z",
    "estado": "operativo"
  },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

## Uso desde Frontend (TypeScript)

### Servicio IA para pasajero

```typescript
// src/services/ia.service.ts
export class IaService extends ClienteApi {
  constructor() {
    super('/ia');
  }

  async predecirETA(viajeId: string, lat: number, lng: number) {
    return this.obtener<any>(
      `/eta/viaje/${viajeId}?lat=${lat}&lng=${lng}`
    );
  }

  async predecirETALinea(lineaId: string, lat: number, lng: number) {
    return this.obtener<any>(
      `/eta/linea/${lineaId}?lat=${lat}&lng=${lng}`
    );
  }

  async detectarCongestion(lat: number, lng: number, radio = 600) {
    return this.obtener<any>(
      `/congestion?lat=${lat}&lng=${lng}&radio=${radio}`
    );
  }

  async obtenerZonasCongestion() {
    return this.obtener<any>('/congestion/zonas');
  }

  async recomendarHorario(dto: any) {
    return this.crear<any>('/horario/recomendacion', dto);
  }

  async obtenerStatus() {
    return this.obtener<any>('/status');
  }
}

// Uso en componente
const iaService = new IaService();
const eta = await iaService.predecirETA('42', -17.8047, -63.1899);
console.log(`Bus llega en ${eta.data.etaMinutos} minutos`);

const horario = await iaService.recomendarHorario({
  lineaId: '5',
  origenLat: -17.8047,
  origenLng: -63.1899,
  destinoLat: -17.7500,
  destinoLng: -63.1500,
  criterio: 'EQUILIBRIO'
});
console.log(`Mejor hora: ${horario.data.horarioOptimo}`);
```

### Servicio para administrador

```typescript
export class AdminIaService extends ClienteApi {
  constructor() {
    super('/ia');
  }

  async analizarAnomaliasBus(busId: string) {
    return this.obtener<any>(`/anomalias/bus/${busId}`);
  }

  async analizarFlota(sindicatoId?: string) {
    return this.crear<any>('/anomalias/flota', {
      sindicatoId,
      soloGraves: true
    });
  }

  async entrenarModelos() {
    return this.crear<any>('/entrenar', {});
  }

  async obtenerMetricas(tipo: string) {
    return this.obtener<any>(`/metricas/${tipo}`);
  }
}
```

---

Últimos ejemplos actualizados: 2024-06-17
