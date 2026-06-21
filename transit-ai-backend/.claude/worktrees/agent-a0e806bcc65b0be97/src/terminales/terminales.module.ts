import { Module } from '@nestjs/common';
import { TerminalesService } from './terminales.service';
import { TerminalesController } from './terminales.controller';

@Module({
  controllers: [TerminalesController],
  providers: [TerminalesService],
  exports: [TerminalesService],
})
export class TerminalesModule {}
