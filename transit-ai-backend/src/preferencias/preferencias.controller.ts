import { Controller, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { PreferenciasService } from './preferencias.service';
import { ActualizarPreferenciaDto } from './dto/actualizar-preferencia.dto';

@Controller('preferencias')
export class PreferenciasController {
  constructor(private readonly preferenciasService: PreferenciasService) {}

  @Get(':usuarioId')
  async obtenerPorUsuario(@Param('usuarioId') usuarioId: string) {
    return await this.preferenciasService.obtenerPorUsuario(usuarioId);
  }

  @Put(':usuarioId')
  async upsert(
    @Param('usuarioId') usuarioId: string,
    @Body() dto: ActualizarPreferenciaDto,
  ) {
    return await this.preferenciasService.upsert(usuarioId, dto);
  }

  @Delete(':usuarioId')
  async eliminar(@Param('usuarioId') usuarioId: string) {
    return await this.preferenciasService.eliminar(usuarioId);
  }
}
