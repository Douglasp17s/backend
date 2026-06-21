import { GeneralStatus } from '@prisma/client';

export interface TipoSindicato {
  id: bigint;
  nombre: string;
  nit: string | null;
  representanteLegal: string;
  telefonoContacto: string;
  emailContacto: string | null;
  direccion: string;
  logoUrl: string | null;
  estado: GeneralStatus;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearSindicato {
  nombre: string;
  nit?: string;
  representanteLegal: string;
  telefonoContacto: string;
  emailContacto?: string;
  direccion: string;
  logoUrl?: string;
}

export interface TipoActualizarSindicato extends Partial<TipoCrearSindicato> {
  estado?: GeneralStatus;
  activo?: boolean;
}
