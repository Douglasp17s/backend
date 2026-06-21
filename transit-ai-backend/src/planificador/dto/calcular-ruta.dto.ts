import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CalcularRutaDto {
  @Type(() => Number) @IsNumber() origenLat: number;
  @Type(() => Number) @IsNumber() origenLng: number;
  @Type(() => Number) @IsNumber() destinoLat: number;
  @Type(() => Number) @IsNumber() destinoLng: number;
}
