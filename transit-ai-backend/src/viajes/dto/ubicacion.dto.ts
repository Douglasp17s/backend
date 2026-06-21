import { IsNumber, IsOptional, IsString, IsNotEmpty, Min, Max } from 'class-validator';

export class UbicacionDto {
  @IsString()
  @IsNotEmpty()
  viajeId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @IsNumber()
  @Min(0)
  @Max(360)
  @IsOptional()
  rumbo?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  velocidad?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precisionMetros?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  nivelBateria?: number;
}
