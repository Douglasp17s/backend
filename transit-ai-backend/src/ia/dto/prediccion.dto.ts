/**
 * DTOs para las predicciones de IA
 * Define los tipos de entrada y salida para cada predicción
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRADA: ETA (Estimated Time of Arrival)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Solicitud de predicción de ETA
 * Calcula el tiempo estimado de llegada del bus a un punto
 */
export interface SolicitarETADto {
  /** ID del viaje para obtener ubicación actual */
  viajeId: string;
  /** Latitud del punto de embarque destino */
  embarqueLat: number;
  /** Longitud del punto de embarque destino */
  embarqueLng: number;
  /** Opcional: factor de tráfico manual (0-1) */
  factorTraficoManual?: number;
}

/**
 * Solicitud de predicción de ETA para la línea
 * Encuentra el bus más cercano y calcula ETA
 */
export interface SolicitarETALineaDto {
  /** ID de la línea */
  lineaId: string;
  /** Latitud del punto de embarque */
  lat: number;
  /** Longitud del punto de embarque */
  lng: number;
}

/**
 * Respuesta de predicción de ETA
 */
export interface ResultadoETADto {
  /** Tiempo estimado en minutos */
  etaMinutos: number;
  /** Distancia aproximada en metros */
  distanciaMetros?: number;
  /** Velocidad promedio esperada en km/h */
  velocidadKmh?: number;
  /** Fuente de la predicción: 'haversine' | 'google' | 'mezcla' */
  fuente: 'haversine' | 'google' | 'mezcla';
  /** Factor de tráfico aplicado (0-100) */
  factorTraficoPct: number;
  /** Información adicional */
  detalles?: {
    busId?: string;
    viajeId?: string;
    ubicacionActualLat?: number;
    ubicacionActualLng?: number;
  };
  /** Confianza en la predicción (0-1) */
  confianza: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRADA: Predicción de Tráfico
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Solicitud de análisis de congestión
 */
export interface AnalizarCongestioDto {
  /** Latitud del punto a analizar */
  lat: number;
  /** Longitud del punto a analizar */
  lng: number;
  /** Radio de búsqueda en metros (default: 600) */
  radioMetros?: number;
  /** Opcional: ID de ruta para análisis específico */
  rutaId?: string;
}

/**
 * Respuesta de análisis de congestión
 */
export interface ResultadoCongestioDto {
  /** Nivel de congestión: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRÍTICO' */
  nivel: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  /** Velocidad promedio en la zona (km/h) */
  velocidadPromedioKmh: number;
  /** Número de buses en la zona */
  busesEnZona: number;
  /** Factor de demora (multiplicador de tiempo base) */
  factorDemora: number;
  /** Descripción legible del estado */
  descripcion: string;
  /** Fuente de datos: 'flota' | 'histórico' | 'ambos' */
  fuente: 'flota' | 'histórico' | 'ambos';
  /** Confianza en la predicción (0-1) */
  confianza: number;
}

/**
 * Respuesta con zonas de congestión detectadas
 */
export interface ZonasCongestionDto {
  zonas: Array<{
    lat: number;
    lng: number;
    nivel: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
    velocidadKmh: number;
    busesDetectados: number;
    descripcion: string;
  }>;
  fechaAnalisis: Date;
  confianza: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRADA: Recomendación de Mejor Hora
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Solicitud de recomendación de horario óptimo
 */
export interface RecomendarHorarioDto {
  /** ID de la línea */
  lineaId: string;
  /** Latitud de origen */
  origenLat: number;
  /** Longitud de origen */
  origenLng: number;
  /** Latitud de destino */
  destinoLat: number;
  /** Longitud de destino */
  destinoLng: number;
  /** Criterio: 'MENOR_TIEMPO' | 'MENOR_TRÁFICO' | 'EQUILIBRIO' */
  criterio?: 'MENOR_TIEMPO' | 'MENOR_TRÁFICO' | 'EQUILIBRIO';
}

/**
 * Respuesta con recomendación de horario
 */
export interface ResultadoHorarioDto {
  /** Horarios recomendados ordenados por preferencia */
  horariosRecomendados: Array<{
    hora: string; // HH:MM
    etaEstimadoMin: number;
    nivelCongestio: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
    confianza: number;
    razon: string;
  }>;
  /** Horario óptimo recomendado */
  horarioOptimo: string; // HH:MM
  /** Por qué es óptimo */
  justificacion: string;
  /** Ahorro de tiempo vs peor horario (minutos) */
  ahorroMinutos: number;
  /** Confianza general (0-1) */
  confianza: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRADA: Detección de Anomalías
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Solicitud de análisis de anomalías en bus
 */
export interface AnalizarAnomaliasBusDto {
  /** ID del bus/interno */
  busId: string;
  /** Opcional: rango de tiempo en minutos (default: 120) */
  ventanaMinutos?: number;
  /** Opcional: incluir datos históricos (default: true) */
  incluirHistorico?: boolean;
}

/**
 * Respuesta de análisis de anomalías
 */
export interface ResultadoAnomaliasDto {
  busId: string;
  tieneAnomalía: boolean;
  puntuacionAnomalía: number; // 0-100
  anomaliasDetectadas: Array<{
    tipo: string; // 'VELOCIDAD_BAJA', 'VELOCIDAD_ALTA', 'PAUSA_LARGA', 'DESVÍO_RUTA'
    severidad: 'BAJA' | 'MEDIA' | 'ALTA';
    descripcion: string;
    momento?: Date;
    recomendacion: string;
  }>;
  metricas: {
    velocidadPromedio: number;
    velocidadMaxima: number;
    velocidadMinima: number;
    tiempoDeDetencion: number; // minutos
    distanciaRecorrida: number; // km
    desvioBrutaCamino: number; // %
  };
  confianza: number;
}

/**
 * Solicitud para analizar anomalías en toda la flota
 */
export interface AnalizarFlotaDto {
  /** Opcional: sindicatoId para filtrar */
  sindicatoId?: string;
  /** Opcional: lineaId para filtrar */
  lineaId?: string;
  /** Opcional: incluir solo anomalías graves */
  soloGraves?: boolean;
}

/**
 * Respuesta con anomalías de la flota
 */
export interface ResultadoFlotaAnomalasDto {
  busesConAnomalía: number;
  totalBusesActivos: number;
  porcentajeAnomalías: number;
  anomaliasDetectadas: ResultadoAnomaliasDto[];
  alertasCríticas: Array<{
    busId: string;
    tipo: string;
    severidad: 'BAJA' | 'MEDIA' | 'ALTA';
    accion_recomendada: string;
  }>;
  confianza: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DTO para guardar predicciones en BD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * DTO para almacenar predicción en la tabla AIPrediction
 */
export interface GuardarPrediccionDto {
  tipo: 'ETA_ARRIVAL' | 'ROUTE_CONGESTION' | 'BEST_TRIP_OPTION' | 'DEMAND_FORECAST';
  inputs: Record<string, any>;
  prediction: Record<string, any>;
  confianza: number;
  busLineId?: bigint;
  modelVersion: string;
  expirationMinutes?: number; // Minutos para que expire (default: 60)
}

/**
 * Respuesta estándar de predicción con metadatos
 */
export interface PredictionMetadataDto {
  id: bigint;
  tipo: string;
  confianza: number;
  creadoEn: Date;
  expiraEn: Date;
  modelVersion: string;
}
