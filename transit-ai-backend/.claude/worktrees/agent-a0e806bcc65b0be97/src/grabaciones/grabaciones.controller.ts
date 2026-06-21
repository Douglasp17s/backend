import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { GrabacionesService } from './grabaciones.service';
import { CrearGrabacionDto } from './dto/crear-grabacion.dto';
import { RevisarGrabacionDto } from './dto/revisar-grabacion.dto';

@Controller('grabaciones')
export class GrabacionesController {
  constructor(private readonly grabacionesService: GrabacionesService) {}

  @Get()
  async obtenerTodas(@Query('lineaId') lineaId?: string, @Query('estado') estado?: string) {
    return await this.grabacionesService.obtenerTodas(lineaId, estado);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.grabacionesService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearGrabacionDto) {
    return await this.grabacionesService.crear(dto);
  }

  @Patch(':id/revisar')
  async revisar(@Param('id') id: string, @Body() dto: RevisarGrabacionDto) {
    return await this.grabacionesService.revisar(id, dto);
  }
}
