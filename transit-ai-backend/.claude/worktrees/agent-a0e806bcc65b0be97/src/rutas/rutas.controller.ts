import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RutasService } from './rutas.service';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';

@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get()
  async obtenerTodas(@Query('lineaId') lineaId?: string) {
    return await this.rutasService.obtenerTodas(lineaId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.rutasService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearRutaDto) {
    return await this.rutasService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarRutaDto) {
    return await this.rutasService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.rutasService.eliminar(id);
  }
}
