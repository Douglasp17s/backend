import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { SindicatosService } from './sindicatos.service';
import { CrearSindicatoDto } from './dto/crear-sindicato.dto';
import { ActualizarSindicatoDto } from './dto/actualizar-sindicato.dto';

@Controller('sindicatos')
export class SindicatosController {
  constructor(private readonly sindicatosService: SindicatosService) {}

  @Get()
  async obtenerTodos() {
    return await this.sindicatosService.obtenerTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.sindicatosService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearSindicatoDto) {
    return await this.sindicatosService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarSindicatoDto) {
    return await this.sindicatosService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.sindicatosService.eliminar(id);
  }
}
