import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';

@Injectable()
export class RutasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodas(lineaId?: string) {
    return this.prisma.route.findMany({
      where: {
        deletedAt: null,
        active: true,
        ...(lineaId ? { lineId: BigInt(lineaId) } : {}),
      },
      include: {
        line: { select: { id: true, name: true, code: true, color: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const ruta = await this.prisma.route.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        line: { select: { id: true, name: true, code: true, color: true } },
        routeRecording: { select: { id: true, status: true, method: true } },
      },
    });

    if (!ruta) throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    return ruta;
  }

  async crear(dto: CrearRutaDto) {
    return this.prisma.route.create({
      data: {
        lineId: BigInt(dto.lineaId),
        name: dto.nombre,
        direction: dto.direccion,
        importedFileUrl: dto.archivoImportadoUrl,
        totalDistanceKm: dto.distanciaKm,
        estimatedTimeMin: dto.tiempoEstimadoMin,
        restTimeMin: dto.tiempoDescansoMin ?? 0,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarRutaDto) {
    await this.obtenerPorId(id);
    return this.prisma.route.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.nombre !== undefined && { name: dto.nombre }),
        ...(dto.direccion !== undefined && { direction: dto.direccion }),
        ...(dto.archivoImportadoUrl !== undefined && { importedFileUrl: dto.archivoImportadoUrl }),
        ...(dto.distanciaKm !== undefined && { totalDistanceKm: dto.distanciaKm }),
        ...(dto.tiempoEstimadoMin !== undefined && { estimatedTimeMin: dto.tiempoEstimadoMin }),
        ...(dto.tiempoDescansoMin !== undefined && { restTimeMin: dto.tiempoDescansoMin }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.route.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
