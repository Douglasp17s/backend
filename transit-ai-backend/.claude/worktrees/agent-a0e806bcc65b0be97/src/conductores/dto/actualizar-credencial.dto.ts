import { IsEnum } from 'class-validator';
import { CredentialStatus } from '@prisma/client';

export class ActualizarCredencialDto {
  @IsEnum(CredentialStatus)
  estadoCredencial: CredentialStatus;
}
