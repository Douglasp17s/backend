/**
 * Módulo Común
 *
 * Centraliza:
 * - Filtros de excepciones globales
 * - Pipes de validación
 * - Interceptores de respuesta
 * - Decoradores personalizados
 * - Utilidades compartidas
 */

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalValidationPipe } from './pipes/validation.pipe';

@Module({
  providers: [
    // Filtro de excepciones global
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Interceptor de respuestas global
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // Pipe de validación global
    {
      provide: APP_PIPE,
      useClass: GlobalValidationPipe,
    },
  ],
  exports: [],
})
export class CommonModule {}
