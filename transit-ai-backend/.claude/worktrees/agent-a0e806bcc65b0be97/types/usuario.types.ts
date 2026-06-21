import { UserRole } from '@prisma/client';

export interface TipoUsuario {
  id: bigint;
  sindicatoId: bigint | null;
  email: string;
  nombre: string;
  telefono: string | null;
  avatarUrl: string | null;
  rol: UserRole;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearUsuario {
  sindicatoId?: number;
  email: string;
  passwordHash: string;
  nombre: string;
  telefono?: string;
  avatarUrl?: string;
  rol?: UserRole;
  creadoPorId?: number;
}

export interface TipoActualizarUsuario {
  nombre?: string;
  telefono?: string;
  avatarUrl?: string;
  rol?: UserRole;
  activo?: boolean;
}
