import { TransferStatus } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class DecidirTrasborodoDto {
  @IsEnum(TransferStatus)
  estado: TransferStatus;

  @IsNumber()
  decididoPorId: number;
}
