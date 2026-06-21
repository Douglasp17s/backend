import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AsignarCategoriaDto {
  /** Categoría del pasajero que determina el descuento on-chain. */
  @IsString()
  @IsNotEmpty()
  @IsIn(['GENERAL', 'ESTUDIANTE', 'ADULTO_MAYOR'])
  categoria!: 'GENERAL' | 'ESTUDIANTE' | 'ADULTO_MAYOR';
}
