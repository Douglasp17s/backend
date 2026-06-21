import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('conductores/lista')
  async obtenerConductores(@CurrentUser() usuario: any) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    return await this.usuariosService.obtenerTodos('DRIVER' as UserRole, sindicatoId);
  }

  @Get()
  async obtenerTodos(@CurrentUser() usuario: any, @Query('rol') rol?: string) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    return await this.usuariosService.obtenerTodos(rol as UserRole, sindicatoId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.usuariosService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearUsuarioDto, @CurrentUser() usuario: any) {
    if (usuario?.syndicateId) dto.sindicatoId = usuario?.syndicateId;
    return await this.usuariosService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto) {
    return await this.usuariosService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.usuariosService.eliminar(id);
  }
}
