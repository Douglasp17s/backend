import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { LineasService } from './lineas.service';
import { CrearLineaDto } from './dto/crear-linea.dto';
import { ActualizarLineaDto } from './dto/actualizar-linea.dto';

@Controller('lineas')
export class LineasController {
  constructor(private readonly lineasService: LineasService) {}

  @Get()
  async obtenerTodas(@Query('sindicatoId') sindicatoId?: string) {
    return await this.lineasService.obtenerTodas(sindicatoId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.lineasService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearLineaDto) {
    return await this.lineasService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarLineaDto) {
    return await this.lineasService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.lineasService.eliminar(id);
  }
}
