import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @IsNumber()
  @IsOptional()
  sindicatoId?: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

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
  creadoPorId?: number;
}
