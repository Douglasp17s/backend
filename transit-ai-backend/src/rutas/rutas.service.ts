import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';

// Calcular distancia entre dos puntos geográficos (Haversine)
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calcular distancia total y tiempo estimado a partir de puntos
function calcularMetricasRuta(puntos: Array<{ lat: number; lng: number }>): { distanciaKm: number; tiempoMin: number; descansoMin: number } {
  if (!puntos || puntos.length < 2) {
    return { distanciaKm: 0, tiempoMin: 0, descansoMin: 0 };
  }

  let distanciaTotal = 0;
  for (let i = 0; i < puntos.length - 1; i++) {
    distanciaTotal += calcularDistancia(puntos[i].lat, puntos[i].lng, puntos[i + 1].lat, puntos[i + 1].lng);
  }

  // Velocidad promedio en transporte urbano: 30 km/h
  const velocidadPromedio = 30;
  const tiempoMin = Math.round((distanciaTotal / velocidadPromedio) * 60);

  // Descanso: 10% del tiempo o mínimo 5 minutos
  const descansoMin = Math.max(5, Math.round(tiempoMin * 0.1));

  return {
    distanciaKm: parseFloat(distanciaTotal.toFixed(2)),
    tiempoMin,
    descansoMin,
  };
}

@Injectable()
export class RutasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodas(lineaId?: string, sindicatoId?: string) {
    const rutas = await this.prisma.route.findMany({
      where: {
        deletedAt: null,
        ...(lineaId ? { lineId: BigInt(lineaId) } : {}),
        ...(sindicatoId ? { line: { syndicateId: BigInt(sindicatoId) } } : {}),
      },
      select: {
        id: true,
        name: true,
        lineId: true,
        drawnPoints: true,
        totalDistanceKm: true,
        estimatedTimeMin: true,
        line: { select: { id: true, name: true, code: true, color: true } },
      },
      orderBy: { name: 'asc' },
    });

    return rutas.map((ruta) => ({
      ...ruta,
      id: ruta.id.toString(),
      lineId: ruta.lineId.toString(),
      drawnPoints: (ruta.drawnPoints as any[]) || [],
    }));
  }

  async obtenerPorId(id: string) {
    const ruta = await this.prisma.route.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      select: {
        id: true,
        name: true,
        lineId: true,
        drawnPoints: true,
        totalDistanceKm: true,
        estimatedTimeMin: true,
        line: { select: { id: true, name: true, code: true, color: true } },
        routeRecording: { select: { id: true, status: true, method: true } },
      },
    });

    if (!ruta) throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    return {
      ...ruta,
      id: ruta.id.toString(),
      lineId: ruta.lineId.toString(),
      drawnPoints: (ruta.drawnPoints as any[]) || [],
    };
  }

  async obtenerParadas(rutaId: string) {
    await this.obtenerPorId(rutaId);
    return { ok: true, data: [] };
  }

  async crear(dto: CrearRutaDto) {
    // Determinar el tipo de grabación
    let recordingType: string | undefined;
    if (dto.puntosRuta && dto.puntosRuta.length > 0) {
      recordingType = 'DRAWN';
    } else if (dto.rutaGrabadaId) {
      recordingType = 'GPS';
    }

    const data: any = {
      lineId: BigInt(dto.lineaId),
      name: dto.nombre,
      direction: dto.direccion,
      importedFileUrl: dto.archivoImportadoUrl,
      restTimeMin: dto.tiempoDescansoMin ?? 0,
    };

    // Solo asignar métricas explícitas si se proporcionan
    if (dto.distanciaKm !== undefined) data.totalDistanceKm = dto.distanciaKm;
    if (dto.tiempoEstimadoMin !== undefined) data.estimatedTimeMin = dto.tiempoEstimadoMin;

    if (dto.puntosRuta && dto.puntosRuta.length > 0) {
      data.drawnPoints = JSON.parse(JSON.stringify(dto.puntosRuta));
      data.startPoint = JSON.parse(JSON.stringify(dto.puntosRuta[0]));
      data.endPoint = JSON.parse(JSON.stringify(dto.puntosRuta[dto.puntosRuta.length - 1]));

      // Calcular automáticamente distancia, tiempo y descanso
      const metricas = calcularMetricasRuta(dto.puntosRuta);
      data.totalDistanceKm = metricas.distanciaKm;
      data.estimatedTimeMin = metricas.tiempoMin;
      data.restTimeMin = metricas.descansoMin;
    }

    if (dto.puntosInicio) data.startPoint = JSON.parse(JSON.stringify(dto.puntosInicio));
    if (dto.puntosFin) data.endPoint = JSON.parse(JSON.stringify(dto.puntosFin));
    if (recordingType) data.recordingType = recordingType;

    if (dto.rutaGrabadaId) {
      data.routeRecordingId = BigInt(dto.rutaGrabadaId);

      // Obtener la grabación para calcular métricas
      const grabacion = await this.prisma.routeRecording.findUnique({
        where: { id: BigInt(dto.rutaGrabadaId) },
      });

      if (grabacion) {
        // Si no se proporcionaron métricas explícitamente, usar la distancia de la grabación
        if (!data.totalDistanceKm && grabacion.distanceKm) {
          data.totalDistanceKm = grabacion.distanceKm;
        }

        // Usar puntos simplificados o registrados para calcular
        const puntos = grabacion.simplifiedPoints || grabacion.recordedPoints;
        if (puntos && Array.isArray(puntos) && puntos.length > 0) {
          const metricas = calcularMetricasRuta(puntos as Array<{ lat: number; lng: number }>);
          if (!data.totalDistanceKm) data.totalDistanceKm = metricas.distanciaKm;
          if (!data.estimatedTimeMin) data.estimatedTimeMin = metricas.tiempoMin;
          data.restTimeMin = metricas.descansoMin;
          data.startPoint = JSON.parse(JSON.stringify(puntos[0]));
          data.endPoint = JSON.parse(JSON.stringify(puntos[puntos.length - 1]));
        }
      }
    }

    return this.prisma.route.create({ data });
  }

  async actualizar(id: string, dto: ActualizarRutaDto) {
    console.log('[RUTAS.SERVICE] Actualizar recibido DTO:', JSON.stringify(dto, null, 2));
    await this.obtenerPorId(id);

    const data: any = {};

    // Actualizar campos normales
    if (dto.nombre !== undefined) data.name = dto.nombre;
    if (dto.direccion !== undefined) data.direction = dto.direccion;
    if (dto.archivoImportadoUrl !== undefined) data.importedFileUrl = dto.archivoImportadoUrl;
    if (dto.distanciaKm !== undefined) data.totalDistanceKm = dto.distanciaKm;
    if (dto.tiempoEstimadoMin !== undefined) data.estimatedTimeMin = dto.tiempoEstimadoMin;
    if (dto.tiempoDescansoMin !== undefined) data.restTimeMin = dto.tiempoDescansoMin;
    if (dto.activo !== undefined) data.active = dto.activo;

    // Determinar el tipo de grabación y calcular métricas si se actualiza con puntos dibujados
    if (dto.puntosRuta !== undefined && dto.puntosRuta.length > 0) {
      data.drawnPoints = JSON.parse(JSON.stringify(dto.puntosRuta));
      data.recordingType = 'DRAWN';
      data.startPoint = JSON.parse(JSON.stringify(dto.puntosRuta[0]));
      data.endPoint = JSON.parse(JSON.stringify(dto.puntosRuta[dto.puntosRuta.length - 1]));

      // Calcular automáticamente distancia, tiempo y descanso basado en los puntos
      const metricas = calcularMetricasRuta(dto.puntosRuta);
      data.totalDistanceKm = metricas.distanciaKm;
      data.estimatedTimeMin = metricas.tiempoMin;
      data.restTimeMin = metricas.descansoMin;

      console.log('[RUTAS.SERVICE] Métricas calculadas:', metricas);
    }
    if (dto.puntosInicio !== undefined) data.startPoint = JSON.parse(JSON.stringify(dto.puntosInicio));
    if (dto.puntosFin !== undefined) data.endPoint = JSON.parse(JSON.stringify(dto.puntosFin));

    if (dto.rutaGrabadaId !== undefined) {
      data.routeRecordingId = dto.rutaGrabadaId ? BigInt(dto.rutaGrabadaId) : null;
      if (dto.rutaGrabadaId) {
        data.recordingType = 'GPS';

        // Obtener la grabación para calcular métricas
        const grabacion = await this.prisma.routeRecording.findUnique({
          where: { id: BigInt(dto.rutaGrabadaId) },
        });

        if (grabacion) {
          // Si no se proporcionaron métricas explícitamente, usar las de la grabación
          if (dto.distanciaKm === undefined && grabacion.distanceKm) {
            data.totalDistanceKm = grabacion.distanceKm;
          }

          // Usar puntos simplificados o registrados para calcular
          const puntos = grabacion.simplifiedPoints || grabacion.recordedPoints;
          if (puntos && Array.isArray(puntos) && puntos.length > 0) {
            const metricas = calcularMetricasRuta(puntos as Array<{ lat: number; lng: number }>);
            if (dto.distanciaKm === undefined) data.totalDistanceKm = metricas.distanciaKm;
            if (dto.tiempoEstimadoMin === undefined) data.estimatedTimeMin = metricas.tiempoMin;
            data.restTimeMin = metricas.descansoMin;
            data.startPoint = JSON.parse(JSON.stringify(puntos[0]));
            data.endPoint = JSON.parse(JSON.stringify(puntos[puntos.length - 1]));
          }
        }
      }
    }

    if (dto.recordingType !== undefined) {
      data.recordingType = dto.recordingType;
    }

    console.log('[RUTAS.SERVICE] Data a actualizar:', JSON.stringify(data, null, 2));
    return this.prisma.route.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.route.update({
      where: { id: BigInt(id) },
      data: { active: false },
    });
  }
}
