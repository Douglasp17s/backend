import { TerminalType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';

export class ActualizarTerminalDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsEnum(TerminalType)
  @IsOptional()
  tipo?: TerminalType;

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

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
