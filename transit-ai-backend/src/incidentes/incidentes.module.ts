import { Module } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { IncidentesController } from './incidentes.controller';
import { IncidentesGateway } from './incidentes.gateway';

@Module({
  controllers: [IncidentesController],
  providers: [IncidentesService, IncidentesGateway],
  exports: [IncidentesService, IncidentesGateway],
})
export class IncidentesModule {}
