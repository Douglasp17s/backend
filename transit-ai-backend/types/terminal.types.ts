/** @deprecated Terminal model no existe */

export interface TipoTerminal {
  id: bigint;
  nombre: string;
  tipo: string;
  latitud: string;
  longitud: string;
  direccion: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearTerminal {
  nombre: string;
  tipo: string;
  latitud: number;
  longitud: number;
  direccion?: string;
  lineaId?: number;
}

export interface TipoActualizarTerminal {
  nombre?: string;
  tipo?: string;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  activo?: boolean;
}

export interface TipoLineaTerminal {
  lineaId: number;
  terminalId: number;
  tipo: string;
  orden: number;
}
