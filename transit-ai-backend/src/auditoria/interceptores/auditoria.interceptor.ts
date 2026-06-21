import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AUDITORIA_METADATA, AuditoriaMetadata } from '../decoradores/auditar.decorator';
import { AuditoriaService } from '../auditoria.service';
import type { User } from '@prisma/client';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditoriaInterceptor.name);

  constructor(
    private reflector: Reflector,
    private auditoriaService: AuditoriaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditoriaMetadata>(AUDITORIA_METADATA, context.getHandler());

    // Si no tiene el decorador @Auditar, pasar
    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const usuario: User | undefined = request.user;

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Obtener descripción del registro
          let descripcion = metadata.descripcion
            ? metadata.descripcion(request, response)
            : `${metadata.accion}: ${metadata.tabla}`;

          // Si la respuesta tiene un nombre o identificador, incluirlo
          if (response && typeof response === 'object') {
            if (response.data?.name) {
              descripcion = `${metadata.accion}: ${response.data.name}`;
            } else if (response.data?.id) {
              descripcion = `${metadata.accion} #${response.data.id}`;
            }
          }

          // Registrar en auditoría
          await this.auditoriaService.registrarAccion({
            userId: usuario?.id ? String(usuario.id) : undefined,
            userRole: usuario?.role,
            sindicatoId: usuario?.syndicateId ? String(usuario.syndicateId) : undefined,
            action: metadata.accion,
            tableName: metadata.tabla,
            recordId: (response?.data?.id || response?.id || '0').toString(),
            recordName: descripcion,
            ipAddress: request.ip,
            userAgent: request.get('User-Agent'),
          });

          this.logger.debug(`✅ Auditoría registrada: ${metadata.accion} en ${metadata.tabla}`);
        } catch (error) {
          this.logger.error(`❌ Error registrando auditoría: ${error}`);
        }
      })
    );
  }
}
