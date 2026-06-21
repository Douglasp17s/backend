import { IsString, IsNumber, IsNotEmpty, Min, Max, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PuntoDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class CrearParadaDto {
  @IsString()
  @IsNotEmpty()
  lineaId!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  centerLat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  centerLng!: number;

  @IsNumber()
  @Min(10)
  @Max(5000)
  @IsOptional()
  radiusMeters?: number;

  /** Puntos que forman el área de la parada [{lat, lng}, ...] */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PuntoDto)
  boundaryPoints?: any[];

  /** Tipo de superficie: STATION, SQUARE, STREET, PARKING, BUILDING, MARKET, OTHER */
  @IsString()
  @IsOptional()
  tipoSuperficie?: string;

  /** Posición ordinal en la línea (0 = primera parada) - calculado automáticamente */
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
