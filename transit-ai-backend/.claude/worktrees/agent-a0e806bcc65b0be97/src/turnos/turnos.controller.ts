import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CrearTurnoDto } from './dto/crear-turno.dto';
import { ActualizarTurnoDto } from './dto/actualizar-turno.dto';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Get()
  async obtenerTodos() {
    return await this.turnosService.obtenerTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.turnosService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearTurnoDto) {
    return await this.turnosService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarTurnoDto) {
    return await this.turnosService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.turnosService.eliminar(id);
  }
}
