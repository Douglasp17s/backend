export interface TipoDesviacion {
  id: bigint;
  viajeId: bigint;
  latitud: string;
  longitud: string;
  distanciaMetros: string;
  justificado: boolean;
  justificacion: string | null;
  revisadoPorId: bigint | null;
  detectadoEn: Date;
  revisadoEn: Date | null;
}

export interface TipoCrearDesviacion {
  viajeId: number;
  latitud: number;
  longitud: number;
  distanciaMetros: number;
}

export interface TipoJustificarDesviacion {
  justificado: boolean;
  justificacion?: string;
  revisadoPorId: number;
}
