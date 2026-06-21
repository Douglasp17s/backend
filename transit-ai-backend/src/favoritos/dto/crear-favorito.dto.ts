import { IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength, Max, Min } from 'class-validator';

export class CrearFavoritoDto {
  @IsNumber()
  usuarioId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  alias: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitudOrigen: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitudOrigen: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  etiquetaOrigen: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitudDestino: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitudDestino: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  etiquetaDestino: string;
}
