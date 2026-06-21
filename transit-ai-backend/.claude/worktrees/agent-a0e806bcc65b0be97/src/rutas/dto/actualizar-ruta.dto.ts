import { RouteDirection } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ActualizarRutaDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsEnum(RouteDirection)
  @IsOptional()
  direccion?: RouteDirection;

  @IsString()
  @IsOptional()
  archivoImportadoUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  distanciaKm?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tiempoEstimadoMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tiempoDescansoMin?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
