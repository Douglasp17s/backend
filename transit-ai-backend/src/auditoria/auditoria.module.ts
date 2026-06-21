import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaInterceptor } from './interceptores/auditoria.interceptor';

@Module({
  imports: [PrismaModule],
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditoriaInterceptor,
    },
  ],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
