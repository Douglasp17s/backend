import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { ActualizarAsignacionDto } from './dto/actualizar-asignacion.dto';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Get()
  async obtenerTodos(
    @Query('sindicatoId') sindicatoId?: string,
    @Query('fecha') fecha?: string,
    @Query('conductorId') conductorId?: string,
  ) {
    return await this.asignacionesService.obtenerTodos(sindicatoId, fecha, conductorId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.asignacionesService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearAsignacionDto) {
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
