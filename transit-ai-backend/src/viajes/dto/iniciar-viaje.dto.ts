import { IsNumber } from 'class-validator';

export class IniciarViajeDto {
  @IsNumber()
  asignacionId: number;
}
