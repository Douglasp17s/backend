import { IsString, IsNumber, Min } from 'class-validator';

export class PagarDto {
  @IsString()
  lineaId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  montoBs?: number;
}
