import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearParadaDto } from './dto/crear-parada.dto';
import { ActualizarParadaDto } from './dto/actualizar-parada.dto';

@Injectable()
export class ParadasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodas(lineaId?: string) {
    const paradas = await this.prisma.stop.findMany({
      where: {
        deletedAt: null,
        ...(lineaId ? { lineId: BigInt(lineaId) } : {}),
      },
      include: {
        line: { select: { id: true, name: true, code: true } },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return paradas.map((p) => ({
      ...p,
      centerLat: Number(p.centerLat),
      centerLng: Number(p.centerLng),
      boundaryPoints: Array.isArray(p.boundaryPoints) ? p.boundaryPoints : [],
    }));
  }

  async obtenerPorId(id: string) {
    const parada = await this.prisma.stop.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        line: { select: { id: true, name: true, code: true } },
      },
    });

    if (!parada) throw new NotFoundException(`Parada con ID ${id} no encontrada`);

    const resultado = {
      ...parada,
      centerLat: Number(parada.centerLat),
      centerLng: Number(parada.centerLng),
      boundaryPoints: Array.isArray(parada.boundaryPoints) ? parada.boundaryPoints : [],
    };

    console.log('Parada obtenida en backend:', JSON.stringify(resultado, null, 2));
    return resultado;
  }

  async crear(dto: CrearParadaDto) {
    // Validar que la línea existe
    const linea = await this.prisma.busLine.findFirst({
      where: { id: BigInt(dto.lineaId), deletedAt: null },
    });

    if (!linea) throw new BadRequestException(`Línea ${dto.lineaId} no encontrada`);

    const puntosValidos = dto.boundaryPoints
      ? dto.boundaryPoints.filter((p: any) => p && p.lat !== undefined && p.lng !== undefined).map((p: any) => ({ lat: p.lat, lng: p.lng }))
      : [];

    // Calcular orderIndex automáticamente (siguiente en la línea)
    const ultimaParada = await this.prisma.stop.findFirst({
      where: { lineId: BigInt(dto.lineaId), deletedAt: null },
      orderBy: { orderIndex: 'desc' },
    });
    const orderIndex = (ultimaParada?.orderIndex ?? -1) + 1;

    // Calcular radiusMeters basado en los puntos del polígono
    let radiusMeters = 100;
    if (puntosValidos.length > 0) {
      const maxDistancia = puntosValidos
        .map((p: any) => this.calcularDistancia(Number(dto.centerLat), Number(dto.centerLng), p.lat, p.lng))
        .reduce((max, dist) => Math.max(max, dist), 0);
      radiusMeters = Math.ceil(maxDistancia * 1000); // Convertir km a metros
    }

    const data: any = {
      lineId: BigInt(dto.lineaId),
      name: dto.nombre,
      description: dto.descripcion,
      centerLat: dto.centerLat,
      centerLng: dto.centerLng,
      radiusMeters: radiusMeters,
      surfaceType: dto.tipoSuperficie ?? 'STATION',
      orderIndex,
    };

    if (puntosValidos.length > 0) {
      data.boundaryPoints = puntosValidos as any;
    }

    const parada = await this.prisma.stop.create({
      data,
      include: {
        line: { select: { id: true, name: true, code: true } },
      },
    });

    return {
      ...parada,
      centerLat: Number(parada.centerLat),
      centerLng: Number(parada.centerLng),
    };
  }

  async actualizar(id: string, dto: ActualizarParadaDto) {
    const paradaActual = await this.obtenerPorId(id);

    const data: any = {};

    console.log('Actualizando parada con DTO:', JSON.stringify(dto, null, 2));

    if (dto.nombre !== undefined) data.name = dto.nombre;
    if (dto.descripcion !== undefined) data.description = dto.descripcion;
    if (dto.centerLat !== undefined) data.centerLat = dto.centerLat;
    if (dto.centerLng !== undefined) data.centerLng = dto.centerLng;
    if (dto.radiusMeters !== undefined) data.radiusMeters = dto.radiusMeters;
    if (dto.boundaryPoints !== undefined && Array.isArray(dto.boundaryPoints)) {
      const puntosValidos = dto.boundaryPoints.filter((p: any) => p && p.lat !== undefined && p.lng !== undefined).map((p: any) => ({ lat: p.lat, lng: p.lng }));
      if (puntosValidos.length > 0) {
        data.boundaryPoints = puntosValidos;
        // Recalcular radio basado en nuevos puntos
        const centerLat = dto.centerLat !== undefined ? dto.centerLat : Number(paradaActual.centerLat);
        const centerLng = dto.centerLng !== undefined ? dto.centerLng : Number(paradaActual.centerLng);
        const maxDistancia = puntosValidos
          .map((p: any) => this.calcularDistancia(centerLat, centerLng, p.lat, p.lng))
          .reduce((max, dist) => Math.max(max, dist), 0);
        data.radiusMeters = Math.ceil(maxDistancia * 1000);
      }
    }
    if (dto.tipoSuperficie !== undefined) data.surfaceType = dto.tipoSuperficie;

    console.log('Data a actualizar en BD:', JSON.stringify(data, null, 2));

    const parada = await this.prisma.stop.update({
      where: { id: BigInt(id) },
      data,
      include: {
        line: { select: { id: true, name: true, code: true } },
      },
    });

    const resultado = {
      ...parada,
      centerLat: Number(parada.centerLat),
      centerLng: Number(parada.centerLng),
      boundaryPoints: Array.isArray(parada.boundaryPoints) ? parada.boundaryPoints : [],
    };

    console.log('Parada actualizada en backend:', JSON.stringify(resultado, null, 2));
    return resultado;
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.stop.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });
  }

  async obtenerCercanasAPunto(latitud: number, longitud: number, radioKm: number = 1) {
    // Obtener todas las paradas activas
    const paradas = await this.prisma.stop.findMany({
      where: { deletedAt: null },
      include: {
        line: { select: { id: true, name: true, code: true } },
      },
    });

    // Filtrar por distancia usando fórmula Haversine
    return paradas
      .filter((parada) => {
        const distancia = this.calcularDistancia(
          latitud,
          longitud,
          Number(parada.centerLat),
          Number(parada.centerLng),
        );
        return distancia <= radioKm;
      })
      .map((p) => ({
        ...p,
        centerLat: Number(p.centerLat),
        centerLng: Number(p.centerLng),
      }));
  }

  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
