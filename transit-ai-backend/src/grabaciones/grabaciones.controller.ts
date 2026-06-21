import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { GrabacionesService } from './grabaciones.service';
import { CrearGrabacionDto } from './dto/crear-grabacion.dto';
import { RevisarGrabacionDto } from './dto/revisar-grabacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('grabaciones')
export class GrabacionesController {
  constructor(private readonly grabacionesService: GrabacionesService) {}

  @Get()
  async obtenerTodas(
    @CurrentUser() usuario: any,
    @Query('lineaId') lineaId?: string,
    @Query('estado') estado?: string,
  ) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    return await this.grabacionesService.obtenerTodas(lineaId, estado, sindicatoId);
  }

  @Get('sin-revisar')
  async obtenerSinRevisar() {
    return await this.grabacionesService.obtenerSinRevisar();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.grabacionesService.obtenerPorId(id);
  }

  @Get(':id/url-reproduccion')
  async obtenerUrlReproduccion(@Param('id') id: string) {
    return await this.grabacionesService.obtenerUrlReproduccion(id);
  }

  @Post()
  async crear(@Body() dto: CrearGrabacionDto) {
    return await this.grabacionesService.crear(dto);
  }

  @Patch(':id/revisar')
  async revisar(@Param('id') id: string, @Body() dto: RevisarGrabacionDto) {
    return await this.grabacionesService.revisar(id, dto);
  }
}
