import { Module } from '@nestjs/common';
import { TrasboardosService } from './trasbordos.service';
import { TrasboardosController } from './trasbordos.controller';

@Module({
  controllers: [TrasboardosController],
  providers: [TrasboardosService],
  exports: [TrasboardosService],
})
export class TrasboardosModule {}
