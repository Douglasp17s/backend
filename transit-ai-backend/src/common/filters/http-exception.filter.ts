/**
 * Filtro Global de Excepciones HTTP
 *
 * Normaliza todas las respuestas de error en la aplicación
 * Formato consistente: { ok: false, error: string, message?: string }
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * Interfaz normalizada de respuesta de error
 */
export interface ErrorResponse {
  ok: false;
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Error interno del servidor';
    let message: string | undefined;

    // Manejar HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object') {
        errorMessage = (response as any).error || (response as any).message || errorMessage;
        message = (response as any).message;
      } else {
        errorMessage = response as string;
      }
    }

    // Manejar otros tipos de excepciones
    else if (exception instanceof Error) {
      errorMessage = exception.message || 'Error desconocido';
      // En desarrollo, loguear stack trace completo
      if (process.env.NODE_ENV === 'development') {
        this.logger.error(exception.stack);
      }
    } else {
      errorMessage = String(exception);
    }

    const responseBody: ErrorResponse = {
      ok: false,
      error: errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (message) {
      responseBody.message = message;
    }

    // Log en producción
    if (process.env.NODE_ENV === 'production') {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - ${errorMessage}`
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
