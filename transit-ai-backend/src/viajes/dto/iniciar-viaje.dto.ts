import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class IniciarViajeDto {
  @Type(() => Number)
  @IsNumber()
  asignacionId: number;
}
