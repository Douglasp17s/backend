import { IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CrearConductorDto {
  @IsNumber()
  usuarioId: number;

  @IsNumber()
  sindicatoId: number;

  @IsNumber()
  @IsOptional()
  lineaId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cedulaIdentidad: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  extensionCI?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numeroLicencia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  categoriaLicencia: string;

  @IsString()
  @IsNotEmpty()
  vencimientoLicencia: string;
}
