import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ActualizarDescuentoDto {
  /** Categoría a la que se aplica el descuento. */
  @IsString()
  @IsNotEmpty()
  @IsIn(['GENERAL', 'ESTUDIANTE', 'ADULTO_MAYOR'])
  categoria!: 'GENERAL' | 'ESTUDIANTE' | 'ADULTO_MAYOR';

  /** Descuento en porcentaje (0 a 100). Ej: 50 = 50%. */
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje!: number;
}
