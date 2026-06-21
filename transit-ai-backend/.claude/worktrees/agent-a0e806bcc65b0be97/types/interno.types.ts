import { BusOperationalStatus } from '@prisma/client';

export interface TipoInterno {
  id: bigint;
  sindicatoId: bigint;
  lineaId: bigint | null;
  numeroInterno: string;
  placa: string;
  modelo: string;
  anioFabricacion: number | null;
  capacidad: number;
  idDispositivoGps: string | null;
  estadoOperacional: BusOperationalStatus;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearInterno {
  sindicatoId: number;
  lineaId?: number;
  numeroInterno: string;
  placa: string;
  modelo: string;
  anioFabricacion?: number;
  capacidad: number;
  idDispositivoGps?: string;
}

export interface TipoActualizarInterno {
  lineaId?: number;
  numeroInterno?: string;
  placa?: string;
  modelo?: string;
  anioFabricacion?: number;
  capacidad?: number;
  idDispositivoGps?: string;
  estadoOperacional?: BusOperationalStatus;
  activo?: boolean;
}
