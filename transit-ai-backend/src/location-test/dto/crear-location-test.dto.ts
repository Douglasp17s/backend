import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CrearLocationTestDto {
  @IsString()
  internalId!: string;

  @IsString()
  syndicateId!: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  speedKmh?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}
