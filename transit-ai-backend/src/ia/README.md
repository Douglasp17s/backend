# Módulo de IA - Transit AI Backend

Módulo completo de predicciones e IA para el sistema de transporte público.

## Arquitectura

```
ia/
├── ia.module.ts              # Módulo principal
├── ia.controller.ts          # Endpoints REST
├── ia.service.ts             # Servicio orquestador
├── dto/
│   └── prediccion.dto.ts     # DTOs de entrada/salida
├── predicciones/             # Servicios de predicción
│   ├── eta.prediccion.ts     # ETA (HU-20)
│   ├── trafico.prediccion.ts # Congestión (HU-21)
│   ├── horario.prediccion.ts # Recomendación horario (HU-22)
│   └── anomalias.prediccion.ts # Detección anomalías (HU-23)
└── modelos/
    └── entrenamiento.service.ts # Entrenamiento con histórico
```

## Características

### 1. **ETA (Estimated Time of Arrival)** - HU-20
Predice el tiempo estimado de llegada del bus a un punto de embarque.

**Algoritmo:**
- Cálculo de distancia con Haversine
- Velocidad actual del bus + velocidad histórica de la línea
- Factor de tráfico según condiciones reportadas

**Endpoints:**
- `GET /ia/eta/viaje/:viajeId?lat=...&lng=...`
- `GET /ia/eta/linea/:lineaId?lat=...&lng=...`

**Confianza:** 0.6 - 0.95 dependiendo de datos disponibles

### 2. **Predicción de Tráfico** - HU-21
Detecta congestión en zonas de la ciudad mediante análisis de velocidad de la flota.

**Algoritmo:**
- Compara velocidad actual vs velocidad histórica en la zona
- Ratio velocidad = velocidad_actual / velocidad_histórica
- Clasifica en 4 niveles: BAJO, MODERADO, ALTO, CRÍTICO

**Niveles de congestión:**
- BAJO: ratio > 0.9 (velocidad normal)
- MODERADO: 0.7 < ratio ≤ 0.9 (reducción ~20%)
- ALTO: 0.4 < ratio ≤ 0.7 (reducción ~50%)
- CRÍTICO: ratio ≤ 0.4 (reducción >50%)

**Endpoints:**
- `GET /ia/congestion?lat=...&lng=...&radio=600`
- `GET /ia/congestion/zonas` - Detección de clusters de congestión

**Agrupamiento:** Clustering geográfico automático (800m de radio)

### 3. **Recomendación de Horario Óptimo** - HU-22
Sugiere los mejores horarios para viajar según criterio del usuario.

**Criterios:**
- `MENOR_TIEMPO`: Minimiza ETA
- `MENOR_TRÁFICO`: Minimiza congestión
- `EQUILIBRIO`: Balance entre tiempo y tráfico (default)

**Algoritmo:**
- Evalúa próximas 10 horas
- Para cada hora: predice ETA + congestión esperada
- Puntúa según criterio elegido
- Retorna top 3 opciones + horario óptimo

**Endpoint:**
- `POST /ia/horario/recomendacion`
- Body: `{ lineaId, origenLat, origenLng, destinoLat, destinoLng, criterio? }`

### 4. **Detección de Anomalías** - HU-23
Identifica comportamiento anómalo en buses (para administrador).

**Anomalías detectadas:**
- **VELOCIDAD_BAJA**: < 30% de velocidad histórica
- **VELOCIDAD_ALTA**: > 150% de velocidad histórica + > 50 km/h
- **PAUSA_LARGA**: Detenido > 20 minutos sin movimiento
- **DESVÍO_RUTA**: Recorrer > 15% de distancia extra

**Algoritmo (Isolation Forest simulado):**
- Calcula estadísticas históricas del bus
- Compara puntos actuales con desviaciones esperadas
- Puntuación de anomalía: 0-100
- Severidad: BAJA, MEDIA, ALTA

**Endpoints:**
- `POST /ia/anomalias/bus` - Análisis detallado
- `GET /ia/anomalias/bus/:busId?ventana=120`
- `POST /ia/anomalias/flota` - Análisis de toda la flota

## DTOs

### SolicitarETADto
```typescript
{
  viajeId: string;           // ID del viaje
  embarqueLat: number;       // Lat del punto de destino
  embarqueLng: number;       // Lng del punto de destino
  factorTraficoManual?: number; // Factor 0-1 (opcional)
}
```

### AnalizarCongestioDto
```typescript
{
  lat: number;               // Centro de análisis
  lng: number;
  radioMetros?: number;      // Default: 600m
  rutaId?: string;          // Para análisis específico
}
```

### RecomendarHorarioDto
```typescript
{
  lineaId: string;           // Línea a usar
  origenLat: number;
  origenLng: number;
  destinoLat: number;
  destinoLng: number;
  criterio?: 'MENOR_TIEMPO' | 'MENOR_TRÁFICO' | 'EQUILIBRIO'; // Default: EQUILIBRIO
}
```

### AnalizarAnomaliasBusDto
```typescript
{
  busId: string;             // ID del bus
  ventanaMinutos?: number;   // Default: 120
  incluirHistorico?: boolean; // Default: true
}
```

## Modelos de Datos

### AIPrediction (en BD)
```typescript
{
  id: BigInt;
  type: 'ETA_ARRIVAL' | 'ROUTE_CONGESTION' | 'BEST_TRIP_OPTION' | 'DEMAND_FORECAST';
  inputHash: string;         // SHA256 de inputs (para caché)
  inputs: Json;              // Datos de entrada
  prediction: Json;          // Resultado
  modelVersion: string;      // '1.0', '1.1', etc.
  confidence: Decimal;       // 0.0000 - 1.0000
  createdAt: DateTime;
  expiresAt: DateTime;       // Tiempo de expiración del caché
  busLineId?: BigInt;        // Línea asociada
}
```

## Caching

Todas las predicciones se cachean en la BD con:
- **TTL:** Variable según tipo (ETA: 15min, Tráfico: 5min, Horario: 60min, Anomalías: 30min)
- **Key:** SHA256(inputs) + modelVersion
- **Limpieza:** Automática cuando expire (llamar a `POST /ia/limpiar-cache`)

## Entrenamiento

### Métodos de entrenamiento

```typescript
// Entrenar todos los modelos
POST /ia/entrenar

// Obtener métricas de un modelo
GET /ia/metricas/:tipo
// tipo: ETA_ARRIVAL, ROUTE_CONGESTION, BEST_TRIP_OPTION, DEMAND_FORECAST

// Limpiar caché expirado
POST /ia/limpiar-cache

// Estado del sistema
GET /ia/status
```

### Datos históricos utilizados

- **ETA:** Últimos 7 días de viajes completados
- **Tráfico:** Últimos 7 días de velocidades en flota
- **Horario:** Últimos 7 días de viajes en misma hora
- **Anomalías:** Últimos 30 días de incidentes

## Respuestas Normalizadas

Todas las respuestas siguen el formato:

```json
{
  "ok": true,
  "data": { /* resultado */ },
  "timestamp": "2024-06-17T10:30:00Z"
}
```

En caso de error:

```json
{
  "ok": false,
  "error": "Descripción del error"
}
```

## Confianza de Predicciones

Cada predicción incluye `confianza: 0.0 - 1.0`:

- **< 0.5:** Muy baja (datos insuficientes)
- **0.5 - 0.7:** Baja (datos limitados)
- **0.7 - 0.85:** Media (datos regulares)
- **0.85 - 0.95:** Alta (datos abundantes)
- **> 0.95:** Muy alta (datos históricos extensos)

## Heurísticas Inteligentes

### ETA
- Velocidad mínima: 5 km/h (si bus muy lento, usa histórico)
- Velocidad máxima: 60 km/h
- Factor tráfico máximo: 3x demora
- Confianza: depende de antigüedad de ubicación

### Tráfico
- Buses mínimos en zona: 2 para validar cluster
- Radio de cluster: 800m
- Datos: últimos 5-10 minutos (tiempo real)
- Severidad en condiciones reportadas: ajusta clasificación

### Horario
- Ventana de evaluación: 10 horas
- Datos históricos: 7 días
- Similitud de hora: dentro de la misma hora del día
- Mínimo días de datos: no requerido (usa estimación)

### Anomalías
- Ventana de análisis: configurable (default 120 min)
- Mínimo viajes para estadística: 20
- Desvío mínimo para anomalía: 15% de distancia
- Pausa mínima detectada: 20 minutos

## Inyección de Dependencias

```typescript
// En ia.module.ts
@Module({
  imports: [PrismaModule],
  providers: [
    IaService,
    EtaPrediccion,
    TraficoPrediccion,
    HorarioPrediccion,
    AnomalasPrediccion,
    EntrenamientoService,
  ],
  controllers: [IaController],
  exports: [IaService],
})
export class IaModule {}
```

## Ejemplo de Uso

### Desde Frontend (fetch)

```typescript
// Obtener ETA
const eta = await fetch('/ia/eta/viaje/123?lat=-17.5&lng=-63.5')
  .then(r => r.json());

// Recomendar horario
const horario = await fetch('/ia/horario/recomendacion', {
  method: 'POST',
  body: JSON.stringify({
    lineaId: '5',
    origenLat: -17.5,
    origenLng: -63.5,
    destinoLat: -17.4,
    destinoLng: -63.4,
    criterio: 'EQUILIBRIO'
  })
}).then(r => r.json());
```

### Desde otro módulo NestJS

```typescript
constructor(private iaService: IaService) {}

// Obtener predicción
const eta = await this.iaService.predecirETA(viajeId, lat, lng);

// Analizar flota
const anomalias = await this.iaService.analizarFlotaAnomalias({
  sindicatoId: '1',
  soloGraves: true
});
```

## Logs

El módulo registra:
- Entrenamientos iniciados/completados
- Errores en predicciones
- Warnings en datos faltantes
- Información de caché

Nivel de log: `LOG_LEVEL=debug` para verbose

## Performance

- **ETA:** ~50-100ms (caché: <5ms)
- **Tráfico:** ~200-500ms (caché: <5ms)
- **Horario:** ~1-2s (evaluación de 10 horas, caché: <5ms)
- **Anomalías:** ~500ms-1s (caché: <5ms)

## Límites y Consideraciones

- Máximo 1000 ubicaciones por análisis (antiguas descartadas)
- Máximo 50 viajes históricos para cálculo de velocidad
- Máximo 100 buses por análisis de flota
- Expiración mínima de caché: 5 minutos
- Expiración máxima de caché: 60 minutos

## Futuro (v2.0)

- [ ] Integración con Google Maps Distance Matrix API
- [ ] Machine Learning real (TensorFlow.js)
- [ ] Predicción de demanda (ML)
- [ ] WebSocket para live updates
- [ ] Análisis de patrones de usuario
- [ ] Integración con COVID/eventos especiales
- [ ] Predicción de fallas mecánicas

## Notas de Desarrollo

- Usar `BigInt()` para IDs en Prisma
- Todas las distancias en metros, velocidades en km/h
- Latitud/Longitud con 8 decimales (precisión ~1mm)
- DTOs con `@IsNumber()`, `@IsString()` para validación
- Respuestas normalizadas con `ok: boolean`

---

Última actualización: 2024-06-17 v1.0
