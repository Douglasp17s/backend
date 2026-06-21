import { Module } from '@nestjs/common';
import { SindicatosService } from './sindicatos.service';
import { SindicatosController } from './sindicatos.controller';

@Module({
  controllers: [SindicatosController],
  providers: [SindicatosService],
  exports: [SindicatosService],
})
export class SindicatosModule {}
