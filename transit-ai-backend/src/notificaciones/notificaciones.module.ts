import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesFirebaseService } from './firebase.service';

@Module({
  imports: [PrismaModule],
  providers: [NotificacionesService, NotificacionesFirebaseService],
  controllers: [NotificacionesController],
  exports: [NotificacionesService, NotificacionesFirebaseService],
})
export class NotificacionesModule {}
