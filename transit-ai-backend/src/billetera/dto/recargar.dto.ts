import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecargarDto {
  /** Monto a recargar en Bolivianos (ej: 50 = 50 Bs). */
  @IsNumber()
  @Min(1)
  monto!: number;

  /** Medio de pago tradicional simulado. */
  @IsOptional()
  @IsIn(['TARJETA', 'TRANSFERENCIA'])
  metodo?: 'TARJETA' | 'TRANSFERENCIA';

  /** Referencia del pago externo (últimos dígitos de tarjeta, nro de transferencia). */
  @IsOptional()
  @IsString()
  referencia?: string;
}
