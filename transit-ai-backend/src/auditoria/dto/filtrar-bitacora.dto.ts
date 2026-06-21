import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction, UserRole } from '@prisma/client';

export class FiltrarBitacoraDto {
  @IsOptional()
  @IsString()
  sindicatoId?: string;

  @IsOptional()
  @IsString()
  tableName?: string;

  @IsOptional()
  @IsString()
  accion?: AuditAction;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @IsOptional()
  @IsString()
  desde?: string;

  @IsOptional()
  @IsString()
  hasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limite: number = 20;
}
