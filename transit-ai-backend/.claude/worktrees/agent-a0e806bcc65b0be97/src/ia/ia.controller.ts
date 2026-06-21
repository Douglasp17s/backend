import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IaService } from './ia.service';
import { EtaParamsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ia')
@UseGuards(JwtAuthGuard)
export class IaController {
  constructor(private iaService: IaService) {}

  /**
   * GET /ia/eta?lineaId=X&lat=Y&lng=Z
   * Calcula el tiempo estimado de llegada (ETA) para una línea
   */
  @Get('eta')
  async calcularEta(@Query() dto: EtaParamsDto) {
    return this.iaService.calcularEta(dto);
  }

  /**
   * GET /ia/trafico?lineaId=X
   * Predice condiciones de tráfico para una línea
   */
  @Get('trafico')
  async predecirTrafico(@Query('lineaId') lineaId: string) {
    return this.iaService.predecirTrafico(lineaId);
  }

  /**
   * GET /ia/horario?lineaId=X
   * Recomienda el mejor horario para viajar
   */
  @Get('horario')
  async recomendarHorario(@Query('lineaId') lineaId: string) {
    return this.iaService.recomendarHorario(lineaId);
  }

  /**
   * GET /ia/anomalias?lineaId=X (opcional)
   * Detecta anomalías en el sistema
   */
  @Get('anomalias')
  async detectarAnomalias(@Query('lineaId') lineaId?: string) {
    return this.iaService.detectarAnomalias(lineaId);
  }

  /**
   * GET /ia/predicciones?lineaId=X&lat=Y&lng=Z
   * Obtiene todas las predicciones para una ubicación
   */
  @Get('predicciones')
  async obtenerPredicciones(@Query() dto: EtaParamsDto) {
    return this.iaService.obtenerPredicciones(dto.lineaId, dto.lat, dto.lng);
  }
}
