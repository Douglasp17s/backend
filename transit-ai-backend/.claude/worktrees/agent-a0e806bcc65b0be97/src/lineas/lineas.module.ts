import { Module } from '@nestjs/common';
import { LineasService } from './lineas.service';
import { LineasController } from './lineas.controller';

/**
 * LineasModule agrupa todos los componentes relacionados con las líneas de transporte.
 * PrismaService está disponible gracias al PrismaModule global.
 */
@Module({
  controllers: [LineasController],
  providers: [LineasService],
  exports: [LineasService],
})
export class LineasModule {}
