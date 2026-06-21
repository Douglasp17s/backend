import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { IncidentesGateway } from './incidentes.gateway';
import { CrearIncidenteDto } from './dto/crear-incidente.dto';
import { RevisarIncidenteDto } from './dto/revisar-incidente.dto';

@Controller('incidentes')
export class IncidentesController {
  constructor(
    private readonly incidentesService: IncidentesService,
    private readonly incidentesGateway: IncidentesGateway,
  ) {}

  @Get()
  async obtenerTodos(
    @Query('conductorId') conductorId?: string,
    @Query('estado') estado?: string,
    @Query('viajeId') viajeId?: string,
  ) {
    return await this.incidentesService.obtenerTodos(conductorId, estado, viajeId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.incidentesService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearIncidenteDto) {
    const datos = await this.incidentesService.crear(dto);
    // Notificar vía WebSocket a todos los admins conectados
    this.incidentesGateway.emitirNuevoIncidente({
      id: datos.id?.toString(),
      tipo: datos.type,
      descripcion: datos.description,
      reportadoEn: datos.reportedAt,
    });
    return datos;
  }

  @Patch(':id/revisar')
  async revisar(@Param('id') id: string, @Body() dto: RevisarIncidenteDto) {
    return await this.incidentesService.revisar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.incidentesService.eliminar(id);
  }
}
