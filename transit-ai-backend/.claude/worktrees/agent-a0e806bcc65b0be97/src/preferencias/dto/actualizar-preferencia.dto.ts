import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ActualizarPreferenciaDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  criterioPreferido?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCaminataMetros?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxTrasbordos?: number;

  @IsOptional()
  patronesAprendidos?: any;
}
