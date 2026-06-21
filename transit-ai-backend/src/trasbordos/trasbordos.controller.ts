import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { TrasboardosService } from './trasbordos.service';
import { CalcularTransbordoDto } from './dto/calcular-transbordo.dto';
import { AsignarTransbordoDto } from './dto/asignar-transbordo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('trasbordos')
export class TrasboardosController {
  constructor(private readonly trasboardosService: TrasboardosService) {}

  @Get()
  async obtenerTodos() {
    return this.trasboardosService.obtenerTodos();
  }

  @Get('pendientes')
  async obtenerPendientes() {
    return this.trasboardosService.obtenerPendientes();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.trasboardosService.obtenerPorId(id);
  }

  @Post('calcular-disponibles')
  async calcularDisponibles(@Body() dto: CalcularTransbordoDto) {
    return this.trasboardosService.calcularTransbordosDisponibles(dto);
  }

  @Post('asignar')
  async asignar(@Body() dto: AsignarTransbordoDto) {
    return this.trasboardosService.asignarTransbordo(dto);
  }

  @Patch(':id/decidir')
  async decidir(@Param('id') id: string, @Body() body: any) {
    return this.trasboardosService.decidirTransbordo(id, body);
  }

  @Patch('internos/:id/estado')
  async cambiarEstadoInterno(
    @Param('id') id: string,
    @Query('estado') estado: string,
  ) {
    return this.trasboardosService.cambiarEstadoInterno(
      id,
      estado as any,
    );
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.trasboardosService.eliminarTransbordo(id);
  }
}
