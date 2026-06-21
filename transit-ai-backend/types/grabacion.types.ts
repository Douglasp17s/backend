import { RouteDirection, RouteRecordingMethod, RouteRecordingStatus } from '@prisma/client';

export interface TipoGrabacion {
  id: bigint;
  rutaId: bigint | null;
  lineaId: bigint;
  conductorId: bigint | null;
  aprobadoPorId: bigint | null;
  metodo: RouteRecordingMethod;
  direccion: RouteDirection;
  puntosGrabados: any;
  puntosSimplificados: any | null;
  cantidadPuntos: number;
  duracionMinutos: number | null;
  distanciaKm: string | null;
  estado: RouteRecordingStatus;
  notasRevision: string | null;
  aprobadoEn: Date | null;
  iniciadaEn: Date | null;
  finalizadaEn: Date | null;
  creadoEn: Date;
}

export interface TipoCrearGrabacion {
  rutaId?: number;
  lineaId: number;
  conductorId?: number;
  metodo: RouteRecordingMethod;
  direccion: RouteDirection;
  puntosGrabados: any;
  puntosSimplificados?: any;
  cantidadPuntos: number;
  duracionMinutos?: number;
  distanciaKm?: number;
  iniciadaEn?: string;
  finalizadaEn?: string;
}

export interface TipoRevisarGrabacion {
  estado: RouteRecordingStatus;
  aprobadoPorId: number;
  notasRevision?: string;
}
