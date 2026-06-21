import { Module } from '@nestjs/common';
import { InternosService } from './internos.service';
import { InternosController } from './internos.controller';

/**
 * InternosModule agrupa los componentes para gestionar los vehículos del sistema.
 * PrismaService está disponible globalmente desde PrismaModule.
 */
@Module({
  controllers: [InternosController],
  providers: [InternosService],
  exports: [InternosService],
})
export class InternosModule {}
