import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InternosService } from './internos.service';
import { CrearInternoDto } from './dto/crear-interno.dto';
import { ActualizarInternoDto } from './dto/actualizar-interno.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('internos')
export class InternosController {
  constructor(private readonly internosService: InternosService) {}

  @Get()
  async obtenerTodos(
    @CurrentUser() usuario: any,
    @Query('lineaId') lineaId?: string,
  ) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    const internos = await this.internosService.obtenerTodos(sindicatoId, lineaId);
    return internos.map((i) => this.mapearInterno(i));
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    const interno = await this.internosService.obtenerPorId(id);
    return this.mapearInterno(interno);
  }

  @Post()
  async crear(@Body() dto: CrearInternoDto, @CurrentUser() usuario: any) {
    if (usuario?.syndicateId) dto.sindicatoId = usuario?.syndicateId;
    const interno = await this.internosService.crear(dto);
    return this.mapearInterno(interno);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarInternoDto) {
    const interno = await this.internosService.actualizar(id, dto);
    return this.mapearInterno(interno);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    await this.internosService.eliminar(id);
    return { eliminado: true };
  }

  private mapearInterno(interno: any) {
    return {
      id: interno.id.toString(),
      sindicatoId: interno.syndicateId?.toString(),
      placa: interno.licensePlate,
      lineaId: interno.lineId?.toString(),
      numeroInterno: interno.internalNumber,
      modelo: interno.model,
      anioFabricacion: interno.manufactureYear,
      capacidad: interno.capacity,
      estado: interno.operationalStatus || 'ACTIVE',
      operationalStatus: interno.operationalStatus || 'ACTIVE',
      ultimoMantenimiento: null,
      proximoMantenimiento: null,
      kilometraje: 0,
      creadoEn: interno.createdAt,
      actualizadoEn: interno.updatedAt,
    };
  }
}
