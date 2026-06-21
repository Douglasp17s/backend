import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LocationTestService } from './location-test.service';
import { CrearLocationTestDto } from './dto/crear-location-test.dto';
import { ActualizarLocationTestDto } from './dto/actualizar-location-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

// @UseGuards(JwtAuthGuard)
@Controller('location-test')
export class LocationTestController {
  constructor(private readonly locationTestService: LocationTestService) {}

  /**
   * POST /location-test — Crea nueva ubicación de prueba
   */
  @Post()
  async crear(@Body() dto: CrearLocationTestDto, @CurrentUser() usuario: User) {
    return this.locationTestService.crear(dto);
  }

  /**
   * GET /location-test/sindicato/:syndicateId — Obtiene ubicaciones de un sindicato
   */
  @Get('sindicato/:syndicateId')
  async obtenerPorSindicato(@Param('syndicateId') syndicateId: string) {
    return this.locationTestService.obtenerPorSindicato(syndicateId);
  }

  /**
   * GET /location-test/activas/todas — Obtiene todas las ubicaciones activas
   */
  @Get('activas/todas')
  async obtenerActivas() {
    return this.locationTestService.obtenerActivas();
  }

  /**
   * GET /location-test/:id — Obtiene ubicación específica
   */
  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.locationTestService.obtenerPorId(id);
  }

  /**
   * GET /location-test/historial/:internalId/:syndicateId — Historial de ubicaciones
   */
  @Get('historial/:internalId/:syndicateId')
  async obtenerHistorial(
    @Param('internalId') internalId: string,
    @Param('syndicateId') syndicateId: string,
  ) {
    return this.locationTestService.obtenerHistorialMicro(internalId, syndicateId);
  }

  /**
   * PATCH /location-test/:id — Actualiza ubicación
   */
  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarLocationTestDto) {
    return this.locationTestService.actualizar(id, dto);
  }

  /**
   * DELETE /location-test/:id — Elimina ubicación
   */
  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.locationTestService.eliminar(id);
  }
}
