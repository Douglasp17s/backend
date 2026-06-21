import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { TrasboardosService } from './trasbordos.service';
import { CrearTrasborodoDto } from './dto/crear-trasbordo.dto';
import { DecidirTrasborodoDto } from './dto/decidir-trasbordo.dto';

@Controller('trasbordos')
export class TrasboardosController {
  constructor(private readonly trasboardosService: TrasboardosService) {}

  @Get()
  async obtenerTodos(@Query('estado') estado?: string) {
    return await this.trasboardosService.obtenerTodos(estado);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.trasboardosService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearTrasborodoDto) {
    return await this.trasboardosService.crear(dto);
  }

  @Patch(':id/decidir')
  async decidir(@Param('id') id: string, @Body() dto: DecidirTrasborodoDto) {
    return await this.trasboardosService.decidir(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.trasboardosService.eliminar(id);
  }
}
