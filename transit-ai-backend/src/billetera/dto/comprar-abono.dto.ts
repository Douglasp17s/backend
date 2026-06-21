import { IsOptional, IsString } from 'class-validator';

export class ComprarAbonoDto {
  /** Línea cubierta por el abono. Si se omite, el abono cubre todas las líneas. */
  @IsOptional()
  @IsString()
  lineaId?: string;
}
