import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { CrearFavoritoDto } from './dto/crear-favorito.dto';
import { ActualizarFavoritoDto } from './dto/actualizar-favorito.dto';

@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Get('usuario/:usuarioId')
  async obtenerPorUsuario(@Param('usuarioId') usuarioId: string) {
    return await this.favoritosService.obtenerPorUsuario(usuarioId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.favoritosService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearFavoritoDto) {
    return await this.favoritosService.crear(dto);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarFavoritoDto) {
    return await this.favoritosService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.favoritosService.eliminar(id);
  }
}
