import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto';
import { RegistrarTokenDto } from './dto/registrar-token.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  async crear(@Body() dto: CrearNotificacionDto) {
    return await this.notificacionesService.crear(dto);
  }

  @Get()
  async obtenerMisNotificaciones(@CurrentUser() usuario: any) {
    return await this.notificacionesService.obtenerPorUsuario(usuario.id);
  }

  @Patch(':id/leida')
  async marcarLeida(@Param('id') id: string, @CurrentUser() usuario: any) {
    return await this.notificacionesService.marcarLeida(id, usuario.id);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.notificacionesService.eliminar(id);
  }

  @Post('fcm-token')
  async registrarToken(@Body() dto: RegistrarTokenDto) {
    return await this.notificacionesService.registrarTokenFCM(
      dto.usuarioId,
      dto.fcmToken,
    );
  }
}
