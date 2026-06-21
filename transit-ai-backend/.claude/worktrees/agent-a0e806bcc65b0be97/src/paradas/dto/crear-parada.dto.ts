import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CrearParadaDto {
  @IsString()
  @IsNotEmpty()
  routeId!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud!: number;

  /** Posición ordinal en la ruta (0 = primera parada) */
  @IsNumber()
  @Min(0)
  orderIndex!: number;
}
