import { Module } from '@nestjs/common';
import { PlanificadorController } from './planificador.controller';
import { PlanificadorService } from './planificador.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [PrismaModule, IaModule],
  controllers: [PlanificadorController],
  providers: [PlanificadorService],
})
export class PlanificadorModule {}
