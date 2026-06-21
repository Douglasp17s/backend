import { TerminalType } from '@prisma/client';

export interface TipoTerminal {
  id: bigint;
  nombre: string;
  tipo: TerminalType;
  latitud: string;
  longitud: string;
  direccion: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearTerminal {
  nombre: string;
  tipo: TerminalType;
  latitud: number;
  longitud: number;
  direccion?: string;
  lineaId?: number;
}

export interface TipoActualizarTerminal {
  nombre?: string;
  tipo?: TerminalType;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  activo?: boolean;
}

export interface TipoLineaTerminal {
  lineaId: number;
  terminalId: number;
  tipo: TerminalType;
  orden: number;
}
