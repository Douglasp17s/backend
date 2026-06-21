import { RouteDirection } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CrearRutaDto {
  @IsNumber()
  lineaId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsEnum(RouteDirection)
  direccion: RouteDirection;

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
}
