import { RouteRecordingStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class RevisarGrabacionDto {
  @IsEnum(RouteRecordingStatus)
  estado: RouteRecordingStatus;

  @IsNumber()
  aprobadoPorId: number;

  @IsString()
  @IsOptional()
  notasRevision?: string;
}
