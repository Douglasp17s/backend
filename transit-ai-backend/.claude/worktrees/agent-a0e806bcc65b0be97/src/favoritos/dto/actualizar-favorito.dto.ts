import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';

export class ActualizarFavoritoDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  alias?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitudOrigen?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitudOrigen?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  etiquetaOrigen?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitudDestino?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitudDestino?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  etiquetaDestino?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
