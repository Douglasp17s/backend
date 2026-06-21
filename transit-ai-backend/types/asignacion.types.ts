import { AssignmentStatus } from '@prisma/client';

export interface TipoAsignacion {
  id: bigint;
  sindicatoId: bigint;
  conductorId: bigint;
  busId: bigint;
  rutaId: bigint;
  turnoId: bigint | null;
  fecha: Date;
  horaInicio: Date;
  horaFin: Date;
  vueltasReales: number | null;
  estado: AssignmentStatus;
  notas: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearAsignacion {
  sindicatoId: number;
  conductorId: number;
  busId: number;
  rutaId: number;
  turnoId?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  notas?: string;
}

export interface TipoActualizarAsignacion {
  conductorId?: number;
  busId?: number;
  rutaId?: number;
  turnoId?: number;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  vueltasReales?: number;
  estado?: AssignmentStatus;
  notas?: string;
}
