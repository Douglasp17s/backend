import { Module } from '@nestjs/common';
import { ViajesService } from './viajes.service';
import { ViajesController } from './viajes.controller';
import { ViajesGateway } from './viajes.gateway';

@Module({
  controllers: [ViajesController],
  providers: [ViajesService, ViajesGateway],
  exports: [ViajesService, ViajesGateway],
})
export class ViajesModule {}
