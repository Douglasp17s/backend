import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export const AUDITORIA_METADATA = 'auditoria';

export interface AuditoriaMetadata {
  accion: AuditAction;
  tabla: string;
  descripcion?: (request: any, response: any) => string;
}

/**
 * Decorador para registrar auditoría automáticamente
 * Uso: @Auditar({ accion: 'CREATE', tabla: 'lineas' })
 */
export const Auditar = (config: AuditoriaMetadata) => {
  return SetMetadata(AUDITORIA_METADATA, config);
};
