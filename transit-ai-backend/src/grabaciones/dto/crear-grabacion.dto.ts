import { RouteDirection, RouteRecordingMethod } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CrearGrabacionDto {
  @IsNumber()
  @IsOptional()
  rutaId?: number;

  @IsNumber()
  lineaId: number;

  @IsNumber()
  @IsOptional()
  conductorId?: number;

  @IsEnum(RouteRecordingMethod)
  metodo: RouteRecordingMethod;

  @IsEnum(RouteDirection)
  direccion: RouteDirection;

  // Se recibe como JSON string para evitar problemas con forbidNonWhitelisted
  @IsString()
  puntosGrabados: string;

  @IsString()
  @IsOptional()
  puntosSimplificados?: string;

  @IsNumber()
  @Min(0)
  cantidadPuntos: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duracionMinutos?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  distanciaKm?: number;
}
