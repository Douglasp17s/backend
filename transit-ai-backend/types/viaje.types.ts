import { TripEndReason, TripStatus } from '@prisma/client';

export interface TipoViaje {
  id: bigint;
  asignacionId: bigint;
  conductorId: bigint;
  busId: bigint;
  rutaId: bigint;
  estado: TripStatus;
  razonFin: TripEndReason | null;
  velocidadPromedio: string | null;
  iniciadoEn: Date;
  finalizadoEn: Date | null;
}

export interface TipoIniciarViaje {
  asignacionId: number;
}

export interface TipoFinalizarViaje {
  razonFin?: TripEndReason;
  velocidadPromedio?: number;
}

export interface TipoUbicacion {
  viajeId: string;
  latitud: number;
  longitud: number;
  rumbo?: number;
  velocidad?: number;
  precisionMetros?: number;
  nivelBateria?: number;
}

export interface TipoUbicacionTransmitida {
  viajeId: string;
  latitud: number;
  longitud: number;
  rumbo?: number;
  velocidad?: number;
  registradoEn: Date;
}
