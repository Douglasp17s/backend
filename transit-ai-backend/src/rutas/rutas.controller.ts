import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RutasService } from './rutas.service';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get()
  async obtenerTodas(@CurrentUser() usuario: any, @Query('lineaId') lineaId?: string) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    return await this.rutasService.obtenerTodas(lineaId, sindicatoId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.rutasService.obtenerPorId(id);
  }

  @Get(':id/paradas')
  async obtenerParadas(@Param('id') id: string) {
    return await this.rutasService.obtenerParadas(id);
  }

  @Post()
  async crear(@Body() dto: CrearRutaDto) {
    return await this.rutasService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarRutaDto) {
    console.log('[CONTROLADOR] PATCH /rutas/:id recibido');
    console.log('[CONTROLADOR] ID:', id);
    console.log('[CONTROLADOR] DTO:', JSON.stringify(dto, null, 2));
    console.log('[CONTROLADOR] DTO keys:', Object.keys(dto));
    return await this.rutasService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.rutasService.eliminar(id);
  }
}
