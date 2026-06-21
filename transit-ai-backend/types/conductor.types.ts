import { CredentialStatus } from '@prisma/client';

export interface TipoConductor {
  id: bigint;
  usuarioId: bigint;
  sindicatoId: bigint;
  lineaId: bigint | null;
  cedulaIdentidad: string;
  extensionCI: string | null;
  numeroLicencia: string;
  categoriaLicencia: string;
  vencimientoLicencia: Date;
  estadoCredencial: CredentialStatus;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearConductor {
  usuarioId: number;
  sindicatoId: number;
  lineaId?: number;
  cedulaIdentidad: string;
  extensionCI?: string;
  numeroLicencia: string;
  categoriaLicencia: string;
  vencimientoLicencia: string;
}

export interface TipoActualizarConductor {
  lineaId?: number;
  numeroLicencia?: string;
  categoriaLicencia?: string;
  vencimientoLicencia?: string;
  activo?: boolean;
}

export interface TipoActualizarCredencial {
  estadoCredencial: CredentialStatus;
}
