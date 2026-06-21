import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearDesviacionDto } from './dto/crear-desviacion.dto';
import { JustificarDesviacionDto } from './dto/justificar-desviacion.dto';

@Injectable()
export class DesviosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos(viajeId?: string, justificado?: string) {
    return this.prisma.routeDeviation.findMany({
      where: {
        ...(viajeId ? { tripId: BigInt(viajeId) } : {}),
        ...(justificado !== undefined ? { justified: justificado === 'true' } : {}),
      },
      include: {
        trip: { select: { id: true, status: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const desviacion = await this.prisma.routeDeviation.findUnique({
      where: { id: BigInt(id) },
      include: {
        trip: { select: { id: true, status: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });
    if (!desviacion) throw new NotFoundException(`Desvío con ID ${id} no encontrado`);
    return desviacion;
  }

  async obtenerPorConductor(conductorId: string) {
    const desviaciones = await this.prisma.routeDeviation.findMany({
      where: {
        trip: {
          assignment: {
            driverId: BigInt(conductorId),
          },
        },
      },
      include: {
        trip: { select: { id: true, status: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { detectedAt: 'desc' },
    });
    return { ok: true, data: desviaciones };
  }

  async obtenerPendientes() {
    const desviaciones = await this.prisma.routeDeviation.findMany({
      where: { justified: false },
      include: {
        trip: { select: { id: true, status: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { detectedAt: 'desc' },
    });
    return { ok: true, data: desviaciones };
  }

  async crear(dto: CrearDesviacionDto) {
    return this.prisma.routeDeviation.create({
      data: {
        tripId: BigInt(dto.viajeId),
        latitude: dto.latitud,
        longitude: dto.longitud,
        distanceMeters: dto.distanciaMetros,
      },
    });
  }

  async justificar(id: string, dto: JustificarDesviacionDto) {
    await this.obtenerPorId(id);
    return this.prisma.routeDeviation.update({
      where: { id: BigInt(id) },
      data: {
        justified: dto.justificado,
        justification: dto.justificacion,
        reviewedById: BigInt(dto.revisadoPorId),
        reviewedAt: new Date(),
      },
    });
  }
}
