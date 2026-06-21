import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearTerminalDto } from './dto/crear-terminal.dto';
import { ActualizarTerminalDto } from './dto/actualizar-terminal.dto';

@Injectable()
export class TerminalesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodas(lineaId?: string) {
    return this.prisma.terminal.findMany({
      where: {
        deletedAt: null,
        active: true,
        ...(lineaId ? { busLineId: BigInt(lineaId) } : {}),
      },
      include: {
        busLine: { select: { id: true, name: true, code: true } },
        lineTerminals: { include: { line: { select: { id: true, name: true } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const terminal = await this.prisma.terminal.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        busLine: { select: { id: true, name: true, code: true } },
        lineTerminals: { include: { line: { select: { id: true, name: true } } } },
      },
    });
    if (!terminal) throw new NotFoundException(`Terminal con ID ${id} no encontrada`);
    return terminal;
  }

  async crear(dto: CrearTerminalDto) {
    return this.prisma.terminal.create({
      data: {
        name: dto.nombre,
        type: dto.tipo,
        latitude: dto.latitud,
        longitude: dto.longitud,
        address: dto.direccion,
        busLineId: dto.lineaId ? BigInt(dto.lineaId) : null,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarTerminalDto) {
    await this.obtenerPorId(id);
    return this.prisma.terminal.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.nombre !== undefined && { name: dto.nombre }),
        ...(dto.tipo !== undefined && { type: dto.tipo }),
        ...(dto.latitud !== undefined && { latitude: dto.latitud }),
        ...(dto.longitud !== undefined && { longitude: dto.longitud }),
        ...(dto.direccion !== undefined && { address: dto.direccion }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.terminal.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
