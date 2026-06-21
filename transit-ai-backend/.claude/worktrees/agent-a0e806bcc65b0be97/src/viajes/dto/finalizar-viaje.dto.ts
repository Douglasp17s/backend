import { TripEndReason } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class FinalizarViajeDto {
  @IsEnum(TripEndReason)
  @IsOptional()
  razonFin?: TripEndReason;

  @IsNumber()
  @Min(0)
  @IsOptional()
  velocidadPromedio?: number;
}
