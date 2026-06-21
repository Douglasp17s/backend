import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ConductoresService } from './conductores.service';
import { CrearConductorDto } from './dto/crear-conductor.dto';
import { ActualizarConductorDto } from './dto/actualizar-conductor.dto';
import { ActualizarCredencialDto } from './dto/actualizar-credencial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('conductores')
export class ConductoresController {
  constructor(private readonly conductoresService: ConductoresService) {}

  @Get()
  async obtenerTodos(
    @CurrentUser() usuario: any,
    @Query('lineaId') lineaId?: string,
  ) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    return await this.conductoresService.obtenerTodos(sindicatoId, lineaId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.conductoresService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearConductorDto, @CurrentUser() usuario: any) {
    if (usuario?.syndicateId) dto.sindicatoId = usuario?.syndicateId;
    return await this.conductoresService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarConductorDto) {
    return await this.conductoresService.actualizar(id, dto);
  }

  @Patch(':id/credencial')
  async actualizarCredencial(@Param('id') id: string, @Body() dto: ActualizarCredencialDto) {
    return await this.conductoresService.actualizarCredencial(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.conductoresService.eliminar(id);
  }
}
