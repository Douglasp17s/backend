import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { ActualizarAsignacionDto } from './dto/actualizar-asignacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Get('mi-asignacion-hoy')
  async obtenerMiAsignacionHoy(@CurrentUser() usuario: any) {
    if (!usuario?.id) {
      return null;
    }
    return await this.asignacionesService.obtenerMiAsignacionHoy(usuario.id);
  }

  @Get()
  async obtenerTodos(
    @CurrentUser() usuario: any,
    @Query('fecha') fecha?: string,
    @Query('conductorId') conductorId?: string,
  ) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    return await this.asignacionesService.obtenerTodos(sindicatoId, fecha, conductorId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.asignacionesService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearAsignacionDto, @CurrentUser() usuario: any) {
    if (usuario?.syndicateId) dto.sindicatoId = usuario?.syndicateId;
    return await this.asignacionesService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarAsignacionDto) {
    return await this.asignacionesService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.asignacionesService.eliminar(id);
  }
}
