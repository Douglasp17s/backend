import { NotificationType, UserRole } from '@prisma/client';

export interface TipoNotificacion {
  id: bigint;
  titulo: string;
  cuerpo: string;
  tipo: NotificationType;
  datos: any | null;
  rolDestino: UserRole | null;
  usuarioDestinoId: bigint | null;
  creadoPorId: bigint | null;
  creadoEn: Date;
  expiraEn: Date | null;
}

export interface TipoCrearNotificacion {
  titulo: string;
  cuerpo: string;
  tipo: NotificationType;
  datos?: any;
  rolDestino?: UserRole;
  usuarioDestinoId?: number;
  creadoPorId?: number;
  expiraEn?: string;
}

export interface TipoReciboNotificacion {
  notificacionId: bigint;
  usuarioId: bigint;
  pushToken: string | null;
  pushEnviado: boolean;
  enviadoEn: Date;
  leidoEn: Date | null;
}
