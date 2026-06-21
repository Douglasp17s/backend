import { Module } from '@nestjs/common';
import { ParadasService } from './paradas.service';
import { ParadasController } from './paradas.controller';

/**
 * ParadasModule agrupa los componentes para gestionar paradas de rutas.
 * PrismaService está disponible globalmente desde PrismaModule.
 */
@Module({
  controllers: [ParadasController],
  providers: [ParadasService],
  exports: [ParadasService],
})
export class ParadasModule {}
