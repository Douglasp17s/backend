import { IsInt, Max, Min } from 'class-validator';

export class ActualizarAbonoDto {
  /** Cantidad de viajes equivalentes que cubre el abono. */
  @IsInt()
  @Min(1)
  @Max(500)
  viajes!: number;

  /** Días de validez del abono. */
  @IsInt()
  @Min(1)
  @Max(365)
  dias!: number;
}
