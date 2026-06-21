import { IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CrearInternoDto {
  @IsNumber()
  sindicatoId: number;

  @IsNumber()
  @IsOptional()
  lineaId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  numeroInterno: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  placa: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  modelo: string;

  @IsNumber()
  @IsOptional()
  anioFabricacion?: number;

  @IsNumber()
  @Min(1)
  capacidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  idDispositivoGps?: string;
}
