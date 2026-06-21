import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async obtenerTodos(@Query('rol') rol?: string, @Query('sindicatoId') sindicatoId?: string) {
    return await this.usuariosService.obtenerTodos(rol as UserRole, sindicatoId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.usuariosService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearUsuarioDto) {
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
