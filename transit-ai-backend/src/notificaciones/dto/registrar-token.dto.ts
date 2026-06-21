import { IsString, IsNotEmpty } from 'class-validator';

export class RegistrarTokenDto {
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
