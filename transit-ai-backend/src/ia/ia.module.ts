/**
 * Módulo de IA
 * Proxy a Django ML Service + datos para entrenamiento
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';

@Module({
  imports: [PrismaModule],
  providers: [IaService],
  controllers: [IaController],
  exports: [IaService],
})
export class IaModule {}
