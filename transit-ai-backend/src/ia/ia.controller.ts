/**
 * Controlador de IA - Proxy a Django ML Service
 * Solo redirecciona requests al microservicio de ML
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IaService } from './ia.service';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  // ════════════════════════════════════════════════════════════════
  // PREDICCIONES - Proxy a Django ML Service
  // ════════════════════════════════════════════════════════════════

  @Get('eta/viaje/:viajeId')
  async predecirETAViaje(
    @Param('viajeId') viajeId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<ApiResponse<any>> {
    return this.iaService.proxyToDjango('POST', '/predictions/predict/', {
      prediction_type: 'ETA_ARRIVAL',
      input_data: { distance_km: 10, speed_kmh: 30, hour_of_day: 14, traffic_factor: 1.0 },
    });
  }

  @Get('eta/linea/:lineaId')
  async predecirETALinea(
    @Param('lineaId') lineaId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<ApiResponse<any>> {
    return this.iaService.proxyToDjango('POST', '/predictions/predict/', {
      prediction_type: 'ETA_ARRIVAL',
      input_data: { distance_km: 10, speed_kmh: 30, hour_of_day: 14, traffic_factor: 1.0 },
    });
  }

  @Get('congestion')
  async analizarCongestion(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<ApiResponse<any>> {
    return this.iaService.proxyToDjango('POST', '/predictions/predict/', {
      prediction_type: 'ROUTE_CONGESTION',
      input_data: { speed_kmh: 30, vehicle_count: 50, hour_of_day: 14, day_of_week: 3 },
    });
  }

  @Post('anomalias/bus')
  async analizarAnomaliasBus(@Body() dto: any): Promise<ApiResponse<any>> {
    return this.iaService.proxyToDjango('POST', '/predictions/predict/', {
      prediction_type: 'ANOMALY_DETECTION',
      input_data: {
        speed_kmh: 30,
        acceleration_mss: 0,
        stops_count: 5,
        route_deviation_meters: 100,
      },
    });
  }

  @Post('anomalias/flota')
  async analizarFlotaAnomalias(@Body() dto: any): Promise<ApiResponse<any>> {
    return this.iaService.proxyToDjango('GET', '/predictions/stats/');
  }

  @Get('status')
  async obtenerStatus(): Promise<ApiResponse<any>> {
    return this.iaService.proxyToDjango('GET', '/models/active/');
  }

  @Get('metricas/:tipo')
  async obtenerMetricasModelo(@Param('tipo') tipo: string): Promise<ApiResponse<any>> {
    return this.iaService.proxyToDjango('GET', '/models/');
  }

  // ════════════════════════════════════════════════════════════════
  // ENTRENAMIENTO - Iniciado manualmente via Django Admin
  // ════════════════════════════════════════════════════════════════

  @Post('entrenar')
  async entrenarModelos(): Promise<ApiResponse<any>> {
    return {
      ok: true,
      data: {
        message: 'Entrenamiento controlado desde Django Admin o automático via Celery Beat',
        endpoint: 'http://localhost:8000/admin/ml_api/mlmodel/',
      },
    };
  }

  // ════════════════════════════════════════════════════════════════
  // DATOS DE ENTRENAMIENTO - Sirve datos a Django
  // ════════════════════════════════════════════════════════════════

  @Get('training-data/eta')
  async getETATrainingData(): Promise<ApiResponse<any>> {
    return this.iaService.getETATrainingData();
  }

  @Get('training-data/traffic')
  async getTrafficTrainingData(): Promise<ApiResponse<any>> {
    return this.iaService.getTrafficTrainingData();
  }

  @Get('training-data/anomaly')
  async getAnomalyTrainingData(): Promise<ApiResponse<any>> {
    return this.iaService.getAnomalyTrainingData();
  }

  // ════════════════════════════════════════════════════════════════
  // PREFERENCIAS (mantener por compatibilidad)
  // ════════════════════════════════════════════════════════════════

  @Get('preferencias/:usuarioId')
  async obtenerPreferencias(@Param('usuarioId') usuarioId: string): Promise<ApiResponse<any>> {
    return this.iaService.obtenerPreferencias(usuarioId);
  }

  @Patch('preferencias/:usuarioId')
  async actualizarPreferencias(
    @Param('usuarioId') usuarioId: string,
    @Body() body: any,
  ): Promise<ApiResponse<any>> {
    return this.iaService.actualizarPreferencias(usuarioId, body);
  }

  @Post('preferencias/:usuarioId/uso')
  async registrarUso(
    @Param('usuarioId') usuarioId: string,
    @Body('criterio') criterio: string,
  ): Promise<ApiResponse<any>> {
    return this.iaService.registrarUsoRuta(usuarioId, criterio);
  }
}
