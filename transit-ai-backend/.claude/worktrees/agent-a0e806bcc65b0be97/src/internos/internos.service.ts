import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearInternoDto } from './dto/crear-interno.dto';
import { ActualizarInternoDto } from './dto/actualizar-interno.dto';

@Injectable()
export class InternosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos(sindicatoId?: string, lineaId?: string) {
    return this.prisma.internal.findMany({
      where: {
        deletedAt: null,
        active: true,
        ...(sindicatoId ? { syndicateId: BigInt(sindicatoId) } : {}),
        ...(lineaId ? { lineId: BigInt(lineaId) } : {}),
      },
      include: {
        syndicate: { select: { id: true, name: true } },
        line: { select: { id: true, name: true, code: true } },
      },
      orderBy: { internalNumber: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const interno = await this.prisma.internal.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        syndicate: { select: { id: true, name: true } },
        line: { select: { id: true, name: true, code: true, color: true } },
      },
    });

    if (!interno) throw new NotFoundException(`Interno con ID ${id} no encontrado`);
    return interno;
  }

  async crear(dto: CrearInternoDto) {
    return this.prisma.internal.create({
      data: {
        syndicateId: BigInt(dto.sindicatoId),
        lineId: dto.lineaId ? BigInt(dto.lineaId) : null,
        internalNumber: dto.numeroInterno,
        licensePlate: dto.placa,
        model: dto.modelo,
        manufactureYear: dto.anioFabricacion,
        capacity: dto.capacidad,
        gpsDeviceId: dto.idDispositivoGps,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarInternoDto) {
    await this.obtenerPorId(id);
    return this.prisma.internal.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.lineaId !== undefined && { lineId: dto.lineaId ? BigInt(dto.lineaId) : null }),
        ...(dto.numeroInterno !== undefined && { internalNumber: dto.numeroInterno }),
        ...(dto.placa !== undefined && { licensePlate: dto.placa }),
        ...(dto.modelo !== undefined && { model: dto.modelo }),
        ...(dto.anioFabricacion !== undefined && { manufactureYear: dto.anioFabricacion }),
        ...(dto.capacidad !== undefined && { capacity: dto.capacidad }),
        ...(dto.idDispositivoGps !== undefined && { gpsDeviceId: dto.idDispositivoGps }),
        ...(dto.estadoOperacional !== undefined && { operationalStatus: dto.estadoOperacional }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.internal.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
