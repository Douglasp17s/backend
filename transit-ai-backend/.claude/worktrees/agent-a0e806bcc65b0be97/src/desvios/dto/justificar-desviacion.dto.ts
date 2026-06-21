import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class JustificarDesviacionDto {
  @IsBoolean()
  justificado: boolean;

  @IsString()
  @IsOptional()
  justificacion?: string;

  @IsNumber()
  revisadoPorId: number;
}
