import { IsNumber, Min } from 'class-validator';

export class StripeCheckoutDto {
  /** Monto a recargar en Bolivianos. */
  @IsNumber()
  @Min(1)
  monto!: number;
}
