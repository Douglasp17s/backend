import { IsBoolean, IsNumber, IsOptional, IsString, IsNotEmpty, Matches, MaxLength, Min } from 'class-validator';

export class CrearLineaDto {
  @IsNumber()
  sindicatoId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  tarifa: number;

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
}
