import { IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class EtaParamsDto {
  @IsString()
  lineaId: string;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng: number;
}
