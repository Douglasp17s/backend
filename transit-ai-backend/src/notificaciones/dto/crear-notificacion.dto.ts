import { IsString, IsNotEmpty } from 'class-validator';

export class CrearNotificacionDto {
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;
}
