import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CrearAsignacionDto {
  @IsNumber()
  sindicatoId: number;

  @IsNumber()
  conductorId: number;

  @IsNumber()
  busId: number;

  @IsNumber()
  rutaId: number;

  @IsNumber()
  @IsOptional()
  turnoId?: number;

  @IsDateString()
  fecha: string;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFin: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
