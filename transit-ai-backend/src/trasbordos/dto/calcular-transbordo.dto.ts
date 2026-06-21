import { IsNumber, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';

export class CalcularTransbordoDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  latitudActual!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  longitudActual!: number;

  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(10)
  radioKm?: number;
}
