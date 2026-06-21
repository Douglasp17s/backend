import { IsBoolean, IsNumber, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class ActualizarLineaDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  codigo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tarifa?: number;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color debe ser formato hex (#RRGGBB)' })
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  horaInicioOperacion?: string;

  @IsString()
  @IsOptional()
  horaFinOperacion?: string;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsNumber()
  @IsOptional()
  sindicatoId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
