import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { TerminalesService } from './terminales.service';
import { CrearTerminalDto } from './dto/crear-terminal.dto';
import { ActualizarTerminalDto } from './dto/actualizar-terminal.dto';

@Controller('terminales')
export class TerminalesController {
  constructor(private readonly terminalesService: TerminalesService) {}

  @Get()
  async obtenerTodas(@Query('lineaId') lineaId?: string) {
    return await this.terminalesService.obtenerTodas(lineaId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.terminalesService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearTerminalDto) {
    return await this.terminalesService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarTerminalDto) {
    return await this.terminalesService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.terminalesService.eliminar(id);
  }
}
