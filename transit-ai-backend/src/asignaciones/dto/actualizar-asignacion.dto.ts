import { AssignmentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ActualizarAsignacionDto {
  @IsNumber()
  @IsOptional()
  conductorId?: number;

  @IsNumber()
  @IsOptional()
  busId?: number;

  @IsNumber()
  @IsOptional()
  rutaId?: number;

  @IsNumber()
  @IsOptional()
  turnoId?: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  horaInicio?: string;

  @IsString()
  @IsOptional()
  horaFin?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  vueltasReales?: number;

  @IsEnum(AssignmentStatus)
  @IsOptional()
  estado?: AssignmentStatus;

  @IsString()
  @IsOptional()
  notas?: string;
}
