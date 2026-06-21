import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ViajesService } from './viajes.service';
import { IniciarViajeDto } from './dto/iniciar-viaje.dto';
import { FinalizarViajeDto } from './dto/finalizar-viaje.dto';

@Controller('viajes')
export class ViajesController {
  constructor(private readonly viajesService: ViajesService) {}

  @Get('activos')
  async obtenerActivos() {
    return await this.viajesService.obtenerActivos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.viajesService.obtenerPorId(id);
  }

  @Get(':id/ubicacion')
  async obtenerUltimaUbicacion(@Param('id') id: string) {
    return await this.viajesService.obtenerUltimaUbicacion(id);
  }

  @Post('iniciar')
  async iniciar(@Body() dto: IniciarViajeDto) {
    return await this.viajesService.iniciar(dto);
  }

  @Patch(':id/finalizar')
  async finalizar(@Param('id') id: string, @Body() dto: FinalizarViajeDto) {
    return await this.viajesService.finalizar(id, dto);
  }

  @Patch(':id/cancelar')
  async cancelar(@Param('id') id: string) {
    return await this.viajesService.cancelar(id);
  }
}
