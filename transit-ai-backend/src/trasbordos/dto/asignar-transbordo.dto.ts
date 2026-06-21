import { IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class AsignarTransbordoDto {
  @IsNumber()
  @IsNotEmpty()
  conductorId!: number;

  @IsNumber()
  @IsNotEmpty()
  microActualId!: number;

  @IsNumber()
  @IsNotEmpty()
  nuevoMicroId!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tiempoDescansoAdicionalMin?: number;
}
