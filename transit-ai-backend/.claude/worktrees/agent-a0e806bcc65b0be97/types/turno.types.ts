export interface TipoTurno {
  id: bigint;
  nombre: string | null;
  diasSemana: string;
  horaInicio: Date;
  horaFin: Date;
  vueltasEsperadas: number | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearTurno {
  nombre?: string;
  diasSemana: string;
  horaInicio: string;
  horaFin: string;
  vueltasEsperadas?: number;
}

export interface TipoActualizarTurno {
  nombre?: string;
  diasSemana?: string;
  horaInicio?: string;
  horaFin?: string;
  vueltasEsperadas?: number;
  activo?: boolean;
}
