import { NotificationType, UserRole } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CrearNotificacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  cuerpo: string;

  @IsEnum(NotificationType)
  tipo: NotificationType;

  @IsOptional()
  datos?: any;

  @IsEnum(UserRole)
  @IsOptional()
  rolDestino?: UserRole;

  @IsNumber()
  @IsOptional()
  usuarioDestinoId?: number;

  @IsNumber()
  @IsOptional()
  creadoPorId?: number;

  @IsString()
  @IsOptional()
  expiraEn?: string;
}
