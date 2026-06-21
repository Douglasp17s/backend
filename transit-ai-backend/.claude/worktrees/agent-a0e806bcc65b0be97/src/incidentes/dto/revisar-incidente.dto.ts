import { IncidentStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class RevisarIncidenteDto {
  @IsEnum(IncidentStatus)
  estado: IncidentStatus;

  @IsNumber()
  revisadoPorId: number;

  @IsString()
  @IsOptional()
  notasRevision?: string;
}
