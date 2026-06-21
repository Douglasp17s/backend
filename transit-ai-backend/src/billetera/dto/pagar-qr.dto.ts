import { IsNotEmpty, IsString } from 'class-validator';

export class PagarQrDto {
  /** Token QR generado por la billetera del pasajero. */
  @IsString()
  @IsNotEmpty()
  qr!: string;

  /** Línea en la que viaja (define tarifa y sindicato). */
  @IsString()
  @IsNotEmpty()
  lineaId!: string;
}
