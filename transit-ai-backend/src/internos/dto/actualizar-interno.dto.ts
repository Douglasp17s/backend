import { BusOperationalStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ActualizarInternoDto {
  @IsNumber()
  @IsOptional()
  lineaId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  numeroInterno?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  placa?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  modelo?: string;

  @IsNumber()
  @IsOptional()
  anioFabricacion?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacidad?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  idDispositivoGps?: string;

  @IsEnum(BusOperationalStatus)
  @IsOptional()
  estadoOperacional?: BusOperationalStatus;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
