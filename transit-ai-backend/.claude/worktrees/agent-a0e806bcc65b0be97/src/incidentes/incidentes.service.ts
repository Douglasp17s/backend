import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearIncidenteDto } from './dto/crear-incidente.dto';
import { RevisarIncidenteDto } from './dto/revisar-incidente.dto';

@Injectable()
export class IncidentesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos(conductorId?: string, estado?: string, viajeId?: string) {
    return this.prisma.incident.findMany({
      where: {
        ...(conductorId ? { driverId: BigInt(conductorId) } : {}),
        ...(estado ? { status: estado as any } : {}),
        ...(viajeId ? { tripId: BigInt(viajeId) } : {}),
      },
      include: {
        driver: { include: { user: { select: { id: true, name: true } } } },
        trip: { select: { id: true, status: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { reportedAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const incidente = await this.prisma.incident.findFirst({
      where: { id: BigInt(id) },
      include: {
        driver: { include: { user: { select: { id: true, name: true, email: true } } } },
        trip: { select: { id: true, status: true, startedAt: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });
    if (!incidente) throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    return incidente;
  }

  async crear(dto: CrearIncidenteDto) {
    return this.prisma.incident.create({
      data: {
        tripId: BigInt(dto.viajeId),
        driverId: BigInt(dto.conductorId),
        type: dto.tipo,
        description: dto.descripcion,
        latitude: dto.latitud,
        longitude: dto.longitud,
        requestStopTracking: dto.solicitarPausarGps ?? false,
      },
      include: {
        driver: { include: { user: { select: { id: true, name: true } } } },
        trip: { select: { id: true, status: true } },
      },
    });
  }

  async revisar(id: string, dto: RevisarIncidenteDto) {
    await this.obtenerPorId(id);
    return this.prisma.incident.update({
      where: { id: BigInt(id) },
      data: {
        status: dto.estado,
        reviewedById: BigInt(dto.revisadoPorId),
        reviewedAt: new Date(),
        reviewNotes: dto.notasRevision,
        ...(dto.estado === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.incident.delete({ where: { id: BigInt(id) } });
  }
}
