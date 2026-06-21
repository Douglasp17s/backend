import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { DesviosService } from './desvios.service';
import { CrearDesviacionDto } from './dto/crear-desviacion.dto';
import { JustificarDesviacionDto } from './dto/justificar-desviacion.dto';

@Controller('desvios')
export class DesviosController {
  constructor(private readonly desviosService: DesviosService) {}

  @Get()
  async obtenerTodos(
    @Query('viajeId') viajeId?: string,
    @Query('justificado') justificado?: string,
    @Query('conductorId') conductorId?: string,
  ) {
    return await this.desviosService.obtenerTodos(viajeId, justificado);
  }

  @Get('pendientes')
  async obtenerPendientes() {
    return await this.desviosService.obtenerPendientes();
  }

  @Get('conductor')
  async obtenerPorConductor(@Query('conductorId') conductorId: string) {
    return await this.desviosService.obtenerPorConductor(conductorId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.desviosService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearDesviacionDto) {
    return await this.desviosService.crear(dto);
  }

  @Patch(':id/justificar')
  async justificar(@Param('id') id: string, @Body() dto: JustificarDesviacionDto) {
    return await this.desviosService.justificar(id, dto);
  }
}
