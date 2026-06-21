import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearGrabacionDto } from './dto/crear-grabacion.dto';
import { RevisarGrabacionDto } from './dto/revisar-grabacion.dto';

@Injectable()
export class GrabacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodas(lineaId?: string, estado?: string) {
    return this.prisma.routeRecording.findMany({
      where: {
        ...(lineaId ? { lineId: BigInt(lineaId) } : {}),
        ...(estado ? { status: estado as any } : {}),
      },
      include: {
        line: { select: { id: true, name: true, code: true } },
        driver: { include: { user: { select: { id: true, name: true } } } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const grabacion = await this.prisma.routeRecording.findUnique({
      where: { id: BigInt(id) },
      include: {
        line: { select: { id: true, name: true, code: true } },
        driver: { include: { user: { select: { id: true, name: true, email: true } } } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    if (!grabacion) throw new NotFoundException(`Grabación con ID ${id} no encontrada`);
    return grabacion;
  }

  async crear(dto: CrearGrabacionDto) {
    return this.prisma.routeRecording.create({
      data: {
        routeId: dto.rutaId ? BigInt(dto.rutaId) : null,
        lineId: BigInt(dto.lineaId),
        driverId: dto.conductorId ? BigInt(dto.conductorId) : null,
        method: dto.metodo,
        direction: dto.direccion,
        recordedPoints: dto.puntosGrabados,
        simplifiedPoints: dto.puntosSimplificados ?? null,
        pointCount: dto.cantidadPuntos,
        durationMinutes: dto.duracionMinutos,
        distanceKm: dto.distanciaKm,
      },
    });
  }

  async revisar(id: string, dto: RevisarGrabacionDto) {
    await this.obtenerPorId(id);
    return this.prisma.routeRecording.update({
      where: { id: BigInt(id) },
      data: {
        status: dto.estado,
        approvedById: BigInt(dto.aprobadoPorId),
        reviewNotes: dto.notasRevision,
        approvedAt: new Date(),
      },
    });
  }
}
