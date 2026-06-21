import { IsEmail, IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CrearSindicatoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  nit?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  representanteLegal: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefonoContacto: string;

  @IsEmail()
  @IsOptional()
  emailContacto?: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
