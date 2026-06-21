import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearTrasborodoDto } from './dto/crear-trasbordo.dto';
import { DecidirTrasborodoDto } from './dto/decidir-trasbordo.dto';

@Injectable()
export class TrasboardosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos(estado?: string) {
    return this.prisma.internalTransfer.findMany({
      where: { ...(estado ? { status: estado as any } : {}) },
      include: {
        originTrip: { select: { id: true, status: true } },
        destinationTrip: { select: { id: true, status: true } },
        decidedBy: { select: { id: true, name: true } },
      },
      orderBy: { suggestedAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const trasbordo = await this.prisma.internalTransfer.findFirst({
      where: { id: BigInt(id) },
      include: {
        originTrip: { select: { id: true, status: true, startedAt: true } },
        destinationTrip: { select: { id: true, status: true, startedAt: true } },
        decidedBy: { select: { id: true, name: true } },
      },
    });
    if (!trasbordo) throw new NotFoundException(`Trasbordo con ID ${id} no encontrado`);
    return trasbordo;
  }

  async crear(dto: CrearTrasborodoDto) {
    return this.prisma.internalTransfer.create({
      data: {
        originTripId: BigInt(dto.viajeOrigenId),
        destinationTripId: BigInt(dto.viajeDestinoId),
        latitude: dto.latitud,
        longitude: dto.longitud,
        reason: dto.razon,
      },
    });
  }

  async decidir(id: string, dto: DecidirTrasborodoDto) {
    await this.obtenerPorId(id);
    return this.prisma.internalTransfer.update({
      where: { id: BigInt(id) },
      data: {
        status: dto.estado,
        decidedById: BigInt(dto.decididoPorId),
        decidedAt: new Date(),
        ...(dto.estado === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.internalTransfer.delete({ where: { id: BigInt(id) } });
  }
}
