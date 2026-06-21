import { RouteDirection } from '@prisma/client';

export interface TipoRuta {
  id: bigint;
  lineaId: bigint;
  nombre: string;
  direccion: RouteDirection;
  archivoImportadoUrl: string | null;
  distanciaKm: string | null;
  tiempoEstimadoMin: number | null;
  tiempoDescansoMin: number | null;
  version: number;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearRuta {
  lineaId: number;
  nombre: string;
  direccion: RouteDirection;
  archivoImportadoUrl?: string;
  distanciaKm?: number;
  tiempoEstimadoMin?: number;
  tiempoDescansoMin?: number;
}

export interface TipoActualizarRuta {
  nombre?: string;
  direccion?: RouteDirection;
  archivoImportadoUrl?: string;
  distanciaKm?: number;
  tiempoEstimadoMin?: number;
  tiempoDescansoMin?: number;
  activo?: boolean;
}
