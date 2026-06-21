import { Module } from '@nestjs/common';
import { PreferenciasService } from './preferencias.service';
import { PreferenciasController } from './preferencias.controller';

@Module({
  controllers: [PreferenciasController],
  providers: [PreferenciasService],
  exports: [PreferenciasService],
})
export class PreferenciasModule {}
