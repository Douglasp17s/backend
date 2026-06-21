import { TransferStatus } from '@prisma/client';

export interface TipoTrasbordo {
  id: bigint;
  viajeOrigenId: bigint;
  viajeDestinoId: bigint;
  decididoPorId: bigint | null;
  latitud: string;
  longitud: string;
  estado: TransferStatus;
  razon: string | null;
  sugeridoEn: Date;
  decididoEn: Date | null;
  completadoEn: Date | null;
}

export interface TipoCrearTrasbordo {
  viajeOrigenId: number;
  viajeDestinoId: number;
  latitud: number;
  longitud: number;
  razon?: string;
}

export interface TipoDecidirTrasbordo {
  estado: TransferStatus;
  decididoPorId: number;
}
