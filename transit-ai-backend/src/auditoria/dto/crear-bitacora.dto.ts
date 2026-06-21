import { IsString, IsNumber, IsOptional, IsObject, IsEnum } from 'class-validator';
import { AuditAction, UserRole } from '@prisma/client';

export class CrearBitacoraDto {
  @IsOptional()
  @IsNumber()
  userId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;

  @IsOptional()
  @IsNumber()
  sindicatoId?: string;

  @IsEnum(AuditAction)
  action!: AuditAction;

  @IsString()
  tableName!: string;

  @IsNumber()
  recordId!: string;

  @IsOptional()
  @IsString()
  recordName?: string;

  @IsOptional()
  @IsObject()
  previousData?: any;

  @IsOptional()
  @IsObject()
  newData?: any;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
