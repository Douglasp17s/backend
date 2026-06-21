import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ActualizarTurnoDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  diasSemana?: string;

  @IsString()
  @IsOptional()
  horaInicio?: string;

  @IsString()
  @IsOptional()
  horaFin?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  vueltasEsperadas?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
