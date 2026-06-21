import { IsNotEmpty, IsString } from 'class-validator';

export class StripeConfirmarDto {
  /** ID de la sesión de Stripe Checkout devuelto tras el pago. */
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
