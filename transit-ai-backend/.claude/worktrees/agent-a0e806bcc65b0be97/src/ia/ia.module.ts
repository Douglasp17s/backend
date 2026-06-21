import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * IaModule proporciona predicciones y análisis usando modelos ML simulados.
 * Incluye: ETA, predicción de tráfico, recomendación de horarios, detección de anomalías.
 */
@Module({
  imports: [PrismaModule],
  controllers: [IaController],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}
