import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEnum(UserRole)
  @IsOptional()
  rol?: UserRole;
}
