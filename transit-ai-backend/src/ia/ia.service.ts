/**
 * Servicio de IA - Proxy a Django ML Service + datos para entrenamiento
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class IaService {
  private readonly logger = new Logger('IaService');
  private mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000/api';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Proxy genérico a Django ML Service
   */
  async proxyToDjango(method: 'GET' | 'POST' | 'PATCH', endpoint: string, data?: any): Promise<any> {
    try {
      const url = `${this.mlServiceUrl}${endpoint}`;
      const response = await axios({
        method,
        url,
        data,
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error proxying to Django: ${error.message}`);
      return { ok: false, error: 'ML Service unavailable', data: null };
    }
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * DATOS PARA ENTRENAMIENTO - Sirve datos a Django
   * ════════════════════════════════════════════════════════════════
   */

  async getETATrainingData(): Promise<any> {
    try {
      const trips = await this.prisma.trip.findMany({
        where: {
          finishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          status: 'COMPLETED',
        },
        include: {
          assignment: {
            select: { route: { select: { totalDistanceKm: true } } },
          },
        },
        take: 500,
      });

      const data = trips.map((trip) => ({
        distance_km: trip.assignment?.route?.totalDistanceKm || 10,
        speed_kmh: trip.averageSpeed ? Number(trip.averageSpeed) : 30,
        hour_of_day: trip.startedAt.getHours(),
        traffic_factor: 1.0,
        eta_minutes: trip.finishedAt
          ? (trip.finishedAt.getTime() - trip.startedAt.getTime()) / (1000 * 60)
          : 30,
      }));

      return { ok: true, data };
    } catch (error) {
      this.logger.error(`Error getting ETA training data: ${error.message}`);
      return { ok: false, error: error.message, data: [] };
    }
  }

  async getTrafficTrainingData(): Promise<any> {
    try {
      const locations = await this.prisma.driverLocation.findMany({
        where: {
          recordedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { speed: true, recordedAt: true },
        take: 500,
      });

      const data = locations.map((loc) => ({
        speed_kmh: loc.speed ? Number(loc.speed) : 30,
        vehicle_count: 50,
        hour_of_day: loc.recordedAt.getHours(),
        day_of_week: loc.recordedAt.getDay(),
        congestion_level: Number(loc.speed || 30) < 20 ? 3 : 1,
      }));

      return { ok: true, data };
    } catch (error) {
      this.logger.error(`Error getting traffic training data: ${error.message}`);
      return { ok: false, error: error.message, data: [] };
    }
  }

  async getAnomalyTrainingData(): Promise<any> {
    try {
      const trips = await this.prisma.trip.findMany({
        where: {
          startedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { averageSpeed: true, startedAt: true, finishedAt: true },
        take: 500,
      });

      const data = trips.map((trip) => ({
        speed_kmh: trip.averageSpeed ? Number(trip.averageSpeed) : 30,
        acceleration_mss: 0,
        stops_count: 5,
        route_deviation_meters: 100,
        is_anomaly: 0,
      }));

      return { ok: true, data };
    } catch (error) {
      this.logger.error(`Error getting anomaly training data: ${error.message}`);
      return { ok: false, error: error.message, data: [] };
    }
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * PREFERENCIAS DE USUARIO (mantener por compatibilidad)
   * ════════════════════════════════════════════════════════════════
   */

  async obtenerPreferencias(usuarioId: string): Promise<any> {
    try {
      const pref = await this.prisma.userPreference.findUnique({
        where: { userId: BigInt(usuarioId) },
      });

      return {
        ok: true,
        data: {
          criterioPrincipal: pref?.preferredCriteria ?? 'FASTEST',
          maxCaminataMetros: pref?.maxWalkingMeters ?? 500,
          maxTransbordos: pref?.maxTransfers ?? 2,
        },
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async actualizarPreferencias(usuarioId: string, dto: any): Promise<any> {
    try {
      await this.prisma.userPreference.upsert({
        where: { userId: BigInt(usuarioId) },
        update: dto,
        create: { userId: BigInt(usuarioId), ...dto },
      });

      return { ok: true, data: { message: 'Updated' } };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async registrarUsoRuta(usuarioId: string, criterioUsado: string): Promise<any> {
    try {
      const criterioMap = {
        rapida: 'FASTEST',
        economica: 'LEAST_COST',
        caminata: 'LEAST_WALKING',
      };

      const criterioNormalizado = criterioMap[criterioUsado] || criterioUsado;

      const pref = await this.prisma.userPreference.findUnique({
        where: { userId: BigInt(usuarioId) },
      });

      const patrones = (pref?.learnedPatterns as any) || { criterioUsos: {} };
      patrones.criterioUsos[criterioNormalizado] =
        (patrones.criterioUsos[criterioNormalizado] || 0) + 1;

      await this.prisma.userPreference.upsert({
        where: { userId: BigInt(usuarioId) },
        update: { learnedPatterns: patrones },
        create: {
          userId: BigInt(usuarioId),
          learnedPatterns: patrones,
        },
      });

      return { ok: true, data: { criterioPrincipalAprendido: criterioNormalizado } };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
