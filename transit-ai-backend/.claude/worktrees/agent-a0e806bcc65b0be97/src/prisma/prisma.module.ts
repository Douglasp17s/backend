import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule es un módulo global que provee PrismaService a toda la aplicación.
 * Al ser Global, no necesita importarse en cada módulo que use PrismaService;
 * basta con importarlo una sola vez en AppModule.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
