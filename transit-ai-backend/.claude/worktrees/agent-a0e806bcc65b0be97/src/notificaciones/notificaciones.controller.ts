import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesGateway } from './notificaciones.gateway';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly notificacionesGateway: NotificacionesGateway,
  ) {}

  @Get()
  async obtenerTodas(
    @Query('usuarioDestinoId') usuarioDestinoId?: string,
    @Query('tipo') tipo?: string,
  ) {
    const datos = await this.notificacionesService.obtenerTodas(
      usuarioDestinoId,
      tipo,
    );
    return datos;
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    const datos = await this.notificacionesService.obtenerPorId(id);
    return datos;
  }

  @Post()
  async crear(@Body() dto: CrearNotificacionDto) {
    const datos = await this.notificacionesService.crear(dto);

    const payload = {
      id: datos.id?.toString(),
      titulo: datos.title,
      cuerpo: datos.body,
      tipo: datos.type,
    };

    if (dto.usuarioDestinoId) {
      this.notificacionesGateway.emitirAUsuario(
        String(dto.usuarioDestinoId),
        payload,
      );
    } else if (dto.rolDestino) {
      this.notificacionesGateway.emitirARol(dto.rolDestino, payload);
    } else {
      this.notificacionesGateway.emitirATodos(payload);
    }

    return datos;
  }

  @Patch(':id/leer/:usuarioId')
  async marcarLeida(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    const datos = await this.notificacionesService.marcarLeida(id, usuarioId);
    return datos;
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    const datos = await this.notificacionesService.eliminar(id);
    return datos;
  }
}
