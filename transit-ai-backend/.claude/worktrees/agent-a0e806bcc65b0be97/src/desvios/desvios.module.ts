import { Module } from '@nestjs/common';
import { DesviosService } from './desvios.service';
import { DesviosController } from './desvios.controller';

@Module({
  controllers: [DesviosController],
  providers: [DesviosService],
  exports: [DesviosService],
})
export class DesviosModule {}
