import { IsNumber, Min, Max } from 'class-validator';

export class RecargarDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(10000)
  monto: number;
}
