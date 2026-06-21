import { TerminalType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength, Max, Min } from 'class-validator';

export class CrearTerminalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsEnum(TerminalType)
  tipo: TerminalType;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsNumber()
  @IsOptional()
  lineaId?: number;
}
