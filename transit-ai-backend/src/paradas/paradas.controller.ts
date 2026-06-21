import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ParadasService } from './paradas.service';
import { CrearParadaDto } from './dto/crear-parada.dto';
import { ActualizarParadaDto } from './dto/actualizar-parada.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Auditar } from '../auditoria/decoradores/auditar.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('paradas')
export class ParadasController {
  constructor(private readonly paradasService: ParadasService) {}

  @Get()
  async obtenerTodas(@Query('lineaId') lineaId?: string) {
    return this.paradasService.obtenerTodas(lineaId);
  }

  @Get('cercanas')
  async obtenerCercanas(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radioKm') radioKm?: string,
  ) {
    return this.paradasService.obtenerCercanasAPunto(
      parseFloat(lat),
      parseFloat(lng),
      radioKm ? parseFloat(radioKm) : 1,
    );
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.paradasService.obtenerPorId(id);
  }

  @Post()
  @Auditar({ accion: 'INSERT', tabla: 'stops' })
  async crear(@Body() dto: CrearParadaDto) {
    console.log('=== CREAR PARADA DTO ===');
    console.log('DTO completo:', JSON.stringify(dto, null, 2));
    console.log('boundaryPoints:', dto.boundaryPoints);
    return this.paradasService.crear(dto);
  }

  @Patch(':id')
  @Auditar({ accion: 'UPDATE', tabla: 'stops' })
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarParadaDto) {
    console.log('=== ACTUALIZAR PARADA DTO ===');
    console.log('DTO completo:', JSON.stringify(dto, null, 2));
    console.log('boundaryPoints:', dto.boundaryPoints);
    return this.paradasService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auditar({ accion: 'DELETE', tabla: 'stops' })
  async eliminar(@Param('id') id: string) {
    return this.paradasService.eliminar(id);
  }
}
