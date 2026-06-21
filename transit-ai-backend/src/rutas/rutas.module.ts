import { Module } from '@nestjs/common';
import { RutasService } from './rutas.service';
import { RutasController } from './rutas.controller';

/**
 * RutasModule agrupa los componentes para gestionar rutas de transporte.
 * Exporta RutasService para que ViajesModule pueda validar rutas al iniciar viajes.
 */
@Module({
  controllers: [RutasController],
  providers: [RutasService],
  exports: [RutasService],
})
export class RutasModule {}
