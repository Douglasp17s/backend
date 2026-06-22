import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesFirebaseService } from './firebase.service';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: NotificacionesFirebaseService,
  ) {}

  async crear(dto: CrearNotificacionDto) {
    // Crear notificación en BD
    const notificacion = await this.prisma.notification.create({
      data: {
        title: dto.titulo,
        body: dto.mensaje,
        type: NotificationType.SERVICE_ALERT,
        targetUserId: BigInt(dto.usuarioId),
      },
    });

    // Crear recepción de notificación
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(dto.usuarioId) },
    });

    if (user) {
      const fcmToken = (user as any).fcmToken;

      // Crear receipt
      await this.prisma.notificationReceipt.create({
        data: {
          notificationId: notificacion.id,
          userId: BigInt(dto.usuarioId),
          pushToken: fcmToken || undefined,
        },
      });

      // Enviar push si existe token
      if (fcmToken) {
        await this.firebaseService.enviarNotificacion(
          fcmToken,
          dto.titulo,
          dto.mensaje,
        );

        // Actualizar que se envió el push
        await this.prisma.notificationReceipt.update({
          where: {
            notificationId_userId: {
              notificationId: notificacion.id,
              userId: BigInt(dto.usuarioId),
            },
          },
          data: { pushSent: true, sentAt: new Date() },
        });
      }
    }

    return notificacion;
  }

  async obtenerTodas() {
    return await this.prisma.notification.findMany({
      include: { receipts: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async obtenerPorUsuario(usuarioId: string) {
    const notificaciones = await this.prisma.notificationReceipt.findMany({
      where: { userId: BigInt(usuarioId) },
      include: { notification: true },
      orderBy: { sentAt: 'desc' },
    });

    return notificaciones.map((receipt) => ({
      ...receipt.notification,
      readAt: receipt.readAt,
      pushSent: receipt.pushSent,
    }));
  }

  async marcarLeida(notificacionId: string, usuarioId: string) {
    const receipt = await this.prisma.notificationReceipt.findUnique({
      where: {
        notificationId_userId: {
          notificationId: BigInt(notificacionId),
          userId: BigInt(usuarioId),
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('Recepción de notificación no encontrada');
    }

    return await this.prisma.notificationReceipt.update({
      where: {
        notificationId_userId: {
          notificationId: BigInt(notificacionId),
          userId: BigInt(usuarioId),
        },
      },
      data: { readAt: new Date() },
    });
  }

  async eliminar(notificacionId: string) {
    const notificacion = await this.prisma.notification.findUnique({
      where: { id: BigInt(notificacionId) },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return await this.prisma.notification.delete({
      where: { id: BigInt(notificacionId) },
    });
  }

  async registrarTokenFCM(usuarioId: string, fcmToken: string) {
    return await this.prisma.user.update({
      where: { id: BigInt(usuarioId) },
      data: { fcmToken },
    });
  }
}
