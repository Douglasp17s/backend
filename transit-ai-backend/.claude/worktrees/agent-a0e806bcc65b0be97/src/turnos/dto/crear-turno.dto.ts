import { IsBoolean, IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CrearTurnoDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  diasSemana: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @IsNotEmpty()
  horaFin: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  vueltasEsperadas?: number;
}
