import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SindicatosService } from './sindicatos.service';
import { CrearSindicatoDto } from './dto/crear-sindicato.dto';
import { ActualizarSindicatoDto } from './dto/actualizar-sindicato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('sindicatos')
export class SindicatosController {
  constructor(private readonly sindicatosService: SindicatosService) {}

  @Get()
  async obtenerTodos(@CurrentUser() usuario: any) {
    // Si tiene sindicato propio, solo retorna ese sindicato
    if (usuario?.syndicateId) {
      return await this.sindicatosService.obtenerPorId(usuario?.syndicateId).then((s) => [s]);
    }
    return await this.sindicatosService.obtenerTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.sindicatosService.obtenerPorId(id);
  }

  @Get(':id/lineas')
  async obtenerLineas(@Param('id') id: string) {
    return await this.sindicatosService.obtenerLineas(id);
  }

  @Get(':id/conductores')
  async obtenerConductores(@Param('id') id: string) {
    return await this.sindicatosService.obtenerConductores(id);
  }

  @Get(':id/estadisticas')
  async obtenerEstadisticas(@Param('id') id: string) {
    return await this.sindicatosService.obtenerEstadisticas(id);
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
