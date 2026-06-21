import { PartialType } from '@nestjs/mapped-types';
import { CrearParadaDto } from './crear-parada.dto';

/**
 * DTO para actualizar una parada existente.
 * Todos los campos son opcionales para soportar actualizaciones parciales (PATCH).
 */
export class ActualizarParadaDto extends PartialType(CrearParadaDto) {}
