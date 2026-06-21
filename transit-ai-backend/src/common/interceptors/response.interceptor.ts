/**
 * Interceptor de Respuestas Exitosas
 *
 * Normaliza todas las respuestas exitosas
 * Formato: { ok: true, data: T, message?: string }
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interfaz normalizada de respuesta exitosa
 */
export interface SuccessResponse<T = any> {
  ok: true;
  data?: T;
  message?: string;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<SuccessResponse<any>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // Si ya es una respuesta normalizada, devolverla tal cual
        if (data && typeof data === 'object' && 'ok' in data) {
          return data;
        }

        // Log en desarrollo
        if (process.env.NODE_ENV === 'development') {
          const { method, url } = request;
          this.logger.debug(`[${method}] ${url} - Response normalizado`);
        }

        // Normalizar respuesta
        return {
          ok: true,
          data,
        };
      })
    );
  }
}
