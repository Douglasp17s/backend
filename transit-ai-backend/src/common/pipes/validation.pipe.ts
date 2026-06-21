/**
 * Pipe de Validación Global
 *
 * Valida automáticamente DTOs usando class-validator
 * Normaliza mensajes de error
 */

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

/**
 * Formatea errores de validación en mensaje legible
 */
function formatearErroresValidacion(errores: ValidationError[]): string {
  return errores
    .map((error) => {
      const constraints = Object.values(error.constraints || {}).join(', ');
      return `${error.property}: ${constraints}`;
    })
    .join('; ');
}

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Solo validar si es tipo 'body' y si existe una clase de DTO
    if (metadata.type !== 'body' || !metadata.metatype) {
      return value;
    }

    // No validar tipos primitivos
    if (
      [String, Number, Boolean, Array].includes(metadata.metatype as any)
    ) {
      return value;
    }

    // Convertir a instancia del DTO con transformación de tipos
    const dtoInstance = plainToInstance(metadata.metatype as any, value, {
      enableImplicitConversion: true,
    });

    // Validar
    const errores = await validate(dtoInstance, {
      skipMissingProperties: false,
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Falla si hay propiedades extra
    });

    if (errores.length > 0) {
      const mensaje = formatearErroresValidacion(errores);
      throw new BadRequestException({
        ok: false,
        error: 'Validación fallida',
        message: mensaje,
        details: errores,
      });
    }

    return dtoInstance;
  }
}
