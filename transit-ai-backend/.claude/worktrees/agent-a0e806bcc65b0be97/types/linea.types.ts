export interface TipoLinea {
  id: bigint;
  sindicatoId: bigint;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  tarifa: string;
  color: string;
  horaInicioOperacion: Date | null;
  horaFinOperacion: Date | null;
  imagenUrl: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearLinea {
  sindicatoId: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  tarifa: number;
  color?: string;
  horaInicioOperacion?: string;
  horaFinOperacion?: string;
  imagenUrl?: string;
}

export interface TipoActualizarLinea {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  tarifa?: number;
  color?: string;
  horaInicioOperacion?: string;
  horaFinOperacion?: string;
  imagenUrl?: string;
  activo?: boolean;
}
