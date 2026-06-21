import { IncidentStatus, IncidentType } from '@prisma/client';

export interface TipoIncidente {
  id: bigint;
  viajeId: bigint;
  conductorId: bigint;
  revisadoPorId: bigint | null;
  tipo: IncidentType;
  estado: IncidentStatus;
  descripcion: string;
  latitud: string | null;
  longitud: string | null;
  solicitarPausarGps: boolean;
  gpsPausado: boolean;
  notasRevision: string | null;
  reportadoEn: Date;
  revisadoEn: Date | null;
  resueltooEn: Date | null;
}

export interface TipoCrearIncidente {
  viajeId: number;
  conductorId: number;
  tipo: IncidentType;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  solicitarPausarGps?: boolean;
}

export interface TipoRevisarIncidente {
  estado: IncidentStatus;
  revisadoPorId: number;
  notasRevision?: string;
}
