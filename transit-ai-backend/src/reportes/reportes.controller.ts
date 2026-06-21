import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { FiltrosReportesDto } from './dto/filtros-reportes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

// @UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * GET /reportes/consolidado/:sindicateId — Reporte consolidado
   */
  @Get('consolidado/:sindicateId')
  async obtenerReporte(
    @Param('sindicateId') sindicateId: string,
    @Query() filtros: FiltrosReportesDto,
    @CurrentUser() usuario: User,
  ) {
    return this.reportesService.obtenerReporte(sindicateId, filtros);
  }

  /**
   * GET /reportes/pdf/:sindicateId — Reporte en formato PDF
   */
  @Get('pdf/:sindicateId')
  async exportarPDF(
    @Param('sindicateId') sindicateId: string,
    @Query() filtros: FiltrosReportesDto,
    @CurrentUser() usuario: User,
  ) {
    return this.reportesService.exportarPDF(sindicateId, filtros);
  }

  /**
   * GET /reportes/diarias/:sindicateId/:fecha — Estadísticas diarias
   */
  @Get('diarias/:sindicateId/:fecha')
  async obtenerEstadisticasDiarias(
    @Param('sindicateId') sindicateId: string,
    @Param('fecha') fecha: string,
    @CurrentUser() usuario: User,
  ) {
    return this.reportesService.obtenerEstadisticasDiarias(sindicateId, fecha);
  }
}
