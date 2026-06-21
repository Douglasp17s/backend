import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CrearTrasborodoDto {
  @IsNumber()
  viajeOrigenId: number;

  @IsNumber()
  viajeDestinoId: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @IsString()
  @IsOptional()
  razon?: string;
}
