import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { PlanificadorService } from './planificador.service';
import { CalcularRutaDto } from './dto/calcular-ruta.dto';

@Controller('planificador')
export class PlanificadorController {
  constructor(private readonly planificadorService: PlanificadorService) {}

  @Post('calcular')
  async calcularRuta(@Body() dto: CalcularRutaDto) {
    return this.planificadorService.calcularRuta(
      dto.origenLat,
      dto.origenLng,
      dto.destinoLat,
      dto.destinoLng,
    );
  }

  @Get('lineas-mapa')
  async obtenerLineasMapa() {
    return this.planificadorService.obtenerLineasParaMapa();
  }

  // GET para compatibilidad con el planificador público existente
  @Get('opciones')
  async calcularRutaGet(
    @Query('origenLat') origenLat: string,
    @Query('origenLng') origenLng: string,
    @Query('destinoLat') destinoLat: string,
    @Query('destinoLng') destinoLng: string,
  ) {
    return this.planificadorService.calcularRuta(
      Number(origenLat),
      Number(origenLng),
      Number(destinoLat),
      Number(destinoLng),
    );
  }
}
