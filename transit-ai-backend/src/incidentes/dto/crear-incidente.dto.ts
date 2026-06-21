import { IncidentType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, Max, Min } from 'class-validator';

export class CrearIncidenteDto {
  @IsNumber()
  viajeId: number;

  @IsNumber()
  conductorId: number;

  @IsEnum(IncidentType)
  tipo: IncidentType;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitud?: number;

  @IsBoolean()
  @IsOptional()
  solicitarPausarGps?: boolean;
}
