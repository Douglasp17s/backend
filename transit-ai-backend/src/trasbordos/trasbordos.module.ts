import { Module } from '@nestjs/common';
import { TrasboardosService } from './trasbordos.service';
import { TrasboardosController } from './trasbordos.controller';
import { ParadasModule } from '../paradas/paradas.module';

@Module({
  imports: [ParadasModule],
  controllers: [TrasboardosController],
  providers: [TrasboardosService],
  exports: [TrasboardosService],
})
export class TrasboardosModule {}
