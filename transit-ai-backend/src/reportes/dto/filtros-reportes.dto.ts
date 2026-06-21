import { IsOptional, IsString } from 'class-validator';

export class FiltrosReportesDto {
  @IsOptional()
  @IsString()
  desde?: string; // ISO date

  @IsOptional()
  @IsString()
  hasta?: string; // ISO date

  @IsOptional()
  @IsString()
  conductorId?: string;

  @IsOptional()
  @IsString()
  microId?: string;

  @IsOptional()
  @IsString()
  rutalId?: string;
}
