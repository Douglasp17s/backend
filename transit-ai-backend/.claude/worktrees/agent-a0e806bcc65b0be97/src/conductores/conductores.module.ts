import { Module } from '@nestjs/common';
import { ConductoresService } from './conductores.service';
import { ConductoresController } from './conductores.controller';

/**
 * ConductoresModule agrupa los componentes para gestionar conductores.
 * Exporta ConductoresService para que otros módulos puedan consultar datos de conductores.
 */
@Module({
  controllers: [ConductoresController],
  providers: [ConductoresService],
  exports: [ConductoresService],
})
export class ConductoresModule {}
