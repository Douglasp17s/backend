import { UserRole } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(UserRole)
  @IsOptional()
  rol?: UserRole;

  @IsNumber()
  @IsOptional()
  sindicatoId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
