import { RouteDirection, RouteRecordingMethod } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

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

  puntosGrabados: any;

  puntosSimplificados?: any;

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
