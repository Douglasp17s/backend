import { RouteDirection } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PuntoRutaDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PuntoRutaDto)
  @IsOptional()
  puntosRuta?: PuntoRutaDto[];

  @ValidateNested()
  @Type(() => PuntoRutaDto)
  @IsOptional()
  puntosInicio?: PuntoRutaDto; // Punto de inicio

  @ValidateNested()
  @Type(() => PuntoRutaDto)
  @IsOptional()
  puntosFin?: PuntoRutaDto; // Punto de finalización

  @IsNumber()
  @IsOptional()
  rutaGrabadaId?: number | null;

  @IsString()
  @IsOptional()
  recordingType?: string; // 'GPS' o 'DRAWN'

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
