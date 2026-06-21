import { Module } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';

@Module({
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
