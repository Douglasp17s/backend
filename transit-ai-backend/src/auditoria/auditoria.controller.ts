import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { FiltrarBitacoraDto } from './dto/filtrar-bitacora.dto';
import { CrearBitacoraDto } from './dto/crear-bitacora.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

// @UseGuards(JwtAuthGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /**
   * GET /auditoria — Obtiene la bitácora filtrada
   */
  @Get('bitacora')
  async obtenerBitacora(
    @Query() filtros: FiltrarBitacoraDto,
    @CurrentUser() usuario: User,
  ) {
    const esAdmin = usuario?.role === 'SUPERADMIN' || usuario?.role === 'SINDICATO_ADMIN';
    return this.auditoriaService.obtenerBitacora(filtros, usuario?.syndicateId?.toString(), esAdmin);
  }

  /**
   * GET /auditoria/resumen — Resumen de acciones
   */
  @Get('resumen')
  async obtenerResumen(@CurrentUser() usuario: User) {
    const esAdmin = usuario?.role === 'SUPERADMIN' || usuario?.role === 'SINDICATO_ADMIN';
    return this.auditoriaService.obtenerResumenAcciones(usuario?.syndicateId?.toString(), esAdmin);
  }

  /**
   * POST /auditoria/registrar — Registra una acción
   */
  @Post('registrar')
  async registrarAccion(
    @Body() dto: CrearBitacoraDto,
    @CurrentUser() usuario: User,
  ) {
    dto.userId = String(usuario?.id);
    dto.sindicatoId = usuario?.syndicateId ? String(usuario?.syndicateId) : dto.sindicatoId;
    return this.auditoriaService.registrarAccion(dto);
  }
}
