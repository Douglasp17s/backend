import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodas(usuarioDestinoId?: string, tipo?: string) {
    return this.prisma.notification.findMany({
      where: {
        ...(usuarioDestinoId ? { targetUserId: BigInt(usuarioDestinoId) } : {}),
        ...(tipo ? { type: tipo as any } : {}),
      },
      include: {
        creator: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
        receipts: {
          select: { id: true, userId: true, readAt: true, pushSent: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const notificacion = await this.prisma.notification.findFirst({
      where: { id: BigInt(id) },
      include: {
        creator: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
        receipts: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!notificacion)
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    return notificacion;
  }

  async crear(dto: CrearNotificacionDto) {
    return this.prisma.notification.create({
      data: {
        title: dto.titulo,
        body: dto.cuerpo,
        type: dto.tipo,
        data: dto.datos ? JSON.stringify(dto.datos) : undefined,
        targetRole: dto.rolDestino,
        targetUserId: dto.usuarioDestinoId
          ? BigInt(dto.usuarioDestinoId)
          : null,
        createdById: dto.creadoPorId ? BigInt(dto.creadoPorId) : null,
        expiresAt: dto.expiraEn ? new Date(dto.expiraEn) : null,
      },
    });
  }

  async marcarLeida(notificacionId: string, usuarioId: string) {
    return this.prisma.notificationReceipt.upsert({
      where: {
        notificationId_userId: {
          notificationId: BigInt(notificacionId),
          userId: BigInt(usuarioId),
        },
      },
      update: { readAt: new Date() },
      create: {
        notificationId: BigInt(notificacionId),
        userId: BigInt(usuarioId),
        readAt: new Date(),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.notification.delete({ where: { id: BigInt(id) } });
  }
}
