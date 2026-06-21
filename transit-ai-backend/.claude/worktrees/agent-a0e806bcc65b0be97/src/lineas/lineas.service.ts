import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearLineaDto } from './dto/crear-linea.dto';
import { ActualizarLineaDto } from './dto/actualizar-linea.dto';

@Injectable()
export class LineasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodas(sindicatoId?: string) {
    return this.prisma.busLine.findMany({
      where: {
        deletedAt: null,
        active: true,
        ...(sindicatoId ? { syndicateId: BigInt(sindicatoId) } : {}),
      },
      include: {
        syndicate: { select: { id: true, name: true } },
        _count: { select: { routes: true, drivers: true, internal: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const linea = await this.prisma.busLine.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        syndicate: { select: { id: true, name: true } },
        routes: { where: { deletedAt: null, active: true }, select: { id: true, name: true, direction: true } },
        terminals: { select: { id: true, name: true, type: true } },
        _count: { select: { drivers: true, internal: true } },
      },
    });

    if (!linea) throw new NotFoundException(`Línea con ID ${id} no encontrada`);
    return linea;
  }

  async crear(dto: CrearLineaDto) {
    return this.prisma.busLine.create({
      data: {
        syndicateId: BigInt(dto.sindicatoId),
        name: dto.nombre,
        code: dto.codigo,
        description: dto.descripcion,
        fare: dto.tarifa,
        color: dto.color ?? '#00d992',
        operationStartTime: dto.horaInicioOperacion ? new Date(`1970-01-01T${dto.horaInicioOperacion}`) : null,
        operationEndTime: dto.horaFinOperacion ? new Date(`1970-01-01T${dto.horaFinOperacion}`) : null,
        imageUrl: dto.imagenUrl,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarLineaDto) {
    await this.obtenerPorId(id);
    return this.prisma.busLine.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.nombre !== undefined && { name: dto.nombre }),
        ...(dto.codigo !== undefined && { code: dto.codigo }),
        ...(dto.descripcion !== undefined && { description: dto.descripcion }),
        ...(dto.tarifa !== undefined && { fare: dto.tarifa }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.horaInicioOperacion !== undefined && { operationStartTime: new Date(`1970-01-01T${dto.horaInicioOperacion}`) }),
        ...(dto.horaFinOperacion !== undefined && { operationEndTime: new Date(`1970-01-01T${dto.horaFinOperacion}`) }),
        ...(dto.imagenUrl !== undefined && { imageUrl: dto.imagenUrl }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.busLine.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
