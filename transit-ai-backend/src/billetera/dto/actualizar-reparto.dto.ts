import { IsNumber, Max, Min } from 'class-validator';

export class ActualizarRepartoDto {
  /** Porcentaje del pasaje para el sindicato (0 a 100). */
  @IsNumber()
  @Min(0)
  @Max(100)
  sindicato!: number;

  /** Porcentaje del pasaje para el chofer (0 a 100). */
  @IsNumber()
  @Min(0)
  @Max(100)
  chofer!: number;
}
