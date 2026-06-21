import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearLocationTestDto } from './dto/crear-location-test.dto';
import { ActualizarLocationTestDto } from './dto/actualizar-location-test.dto';

@Injectable()
export class LocationTestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva ubicación de prueba para un micro
   */
  async crear(dto: CrearLocationTestDto) {
    const interno = await this.prisma.internal.findFirst({
      where: { id: BigInt(dto.internalId), deletedAt: null },
    });

    if (!interno) throw new BadRequestException(`Micro ${dto.internalId} no encontrado`);

    return this.prisma.locationTest.create({
      data: {
        internalId: BigInt(dto.internalId),
        syndicateId: BigInt(dto.syndicateId),
        driverId: dto.driverId ? BigInt(dto.driverId) : null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        speedKmh: dto.speedKmh || 0,
        heading: dto.heading,
        accuracy: dto.accuracy,
      },
      include: {
        internal: { select: { id: true, internalNumber: true, licensePlate: true } },
        syndicate: { select: { id: true, name: true } },
        driver: { select: { id: true, email: true, name: true } },
      },
    });
  }

  /**
   * Obtiene todas las ubicaciones de prueba de un sindicato
   */
  async obtenerPorSindicato(syndicateId: string) {
    const ubicaciones = await this.prisma.locationTest.findMany({
      where: {
        syndicateId: BigInt(syndicateId),
        isActive: true,
      },
      include: {
        internal: { select: { id: true, internalNumber: true, licensePlate: true } },
        driver: { select: { id: true, email: true, name: true } },
        syndicate: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return ubicaciones.map((u) => ({
      ...u,
      syndicateId: u.syndicateId ? u.syndicateId.toString() : undefined,
    }));
  }

  /**
   * Obtiene una ubicación específica de prueba
   */
  async obtenerPorId(id: string) {
    const location = await this.prisma.locationTest.findFirst({
      where: { id: BigInt(id) },
      include: {
        internal: { select: { id: true, internalNumber: true, licensePlate: true } },
        syndicate: { select: { id: true, name: true } },
        driver: { select: { id: true, email: true, name: true } },
      },
    });

    if (!location) throw new NotFoundException(`Ubicación ${id} no encontrada`);
    return location;
  }

  /**
   * Actualiza una ubicación de prueba
   */
  async actualizar(id: string, dto: ActualizarLocationTestDto) {
    await this.obtenerPorId(id);

    const data: any = {};

    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.speedKmh !== undefined) data.speedKmh = dto.speedKmh;
    if (dto.heading !== undefined) data.heading = dto.heading;
    if (dto.accuracy !== undefined) data.accuracy = dto.accuracy;
    if (dto.driverId !== undefined) data.driverId = dto.driverId ? BigInt(dto.driverId) : null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.locationTest.update({
      where: { id: BigInt(id) },
      data,
      include: {
        internal: { select: { id: true, internalNumber: true, licensePlate: true } },
        driver: { select: { id: true, email: true, name: true } },
      },
    });
  }

  /**
   * Desactiva una ubicación de prueba
   */
  async desactivar(id: string) {
    return this.actualizar(id, { isActive: false });
  }

  /**
   * Obtiene ubicaciones activas para un micro específico (últimas 100)
   */
  async obtenerHistorialMicro(internalId: string, sindicateId: string) {
    return this.prisma.locationTest.findMany({
      where: {
        internalId: BigInt(internalId),
        syndicateId: BigInt(sindicateId),
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  /**
   * Obtiene todas las ubicaciones activas (para mapa en tiempo real)
   */
  async obtenerActivas() {
    const ubicaciones = await this.prisma.locationTest.findMany({
      where: { isActive: true },
      include: {
        internal: { select: { id: true, internalNumber: true, licensePlate: true } },
        driver: { select: { id: true, email: true, name: true } },
        syndicate: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Mapear con syndicateId explícito (convertir a string)
    const resultado = ubicaciones.map((u) => ({
      ...u,
      syndicateId: u.syndicateId ? u.syndicateId.toString() : undefined,
    }));

    console.log(`📍 obtenerActivas(): ${resultado.length} ubicaciones activas`);
    return resultado;
  }

  /**
   * Elimina ubicación de prueba
   */
  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.locationTest.delete({
      where: { id: BigInt(id) },
    });
  }
}
