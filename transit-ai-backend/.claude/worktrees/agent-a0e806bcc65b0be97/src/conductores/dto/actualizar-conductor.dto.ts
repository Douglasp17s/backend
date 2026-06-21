import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarConductorDto {
  @IsNumber()
  @IsOptional()
  lineaId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  numeroLicencia?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  categoriaLicencia?: string;

  @IsString()
  @IsOptional()
  vencimientoLicencia?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
