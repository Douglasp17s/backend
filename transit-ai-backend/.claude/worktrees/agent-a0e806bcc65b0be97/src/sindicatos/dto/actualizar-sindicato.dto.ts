import { GeneralStatus } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarSindicatoDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  nit?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  representanteLegal?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefonoContacto?: string;

  @IsEmail()
  @IsOptional()
  emailContacto?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsEnum(GeneralStatus)
  @IsOptional()
  estado?: GeneralStatus;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
