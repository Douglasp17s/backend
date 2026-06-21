import { IsNotEmpty, IsString } from 'class-validator';

export class PagarPasajeDto {
  /** Línea cuyo pasaje se paga (define la tarifa y el sindicato que cobra). */
  @IsString()
  @IsNotEmpty()
  lineaId!: string;
}
