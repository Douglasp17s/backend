import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ViajesService } from './viajes.service';
import { UbicacionDto } from './dto/ubicacion.dto';
import { FinalizarViajeDto } from './dto/finalizar-viaje.dto';

@WebSocketGateway({ namespace: 'viajes', cors: { origin: '*' } })
export class ViajesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly viajesService: ViajesService) {}

  handleConnection(client: Socket) {
    console.log(`[Viajes WS] Conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Viajes WS] Desconectado: ${client.id}`);
  }

  /** Pasajero/monitor se suscribe a un viaje para recibir actualizaciones GPS */
  @SubscribeMessage('suscribir-viaje')
  async handleSuscribirViaje(
    @MessageBody() data: { viajeId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await client.join(`viaje-${data.viajeId}`);
      return { exito: true, mensaje: `Suscrito al viaje ${data.viajeId}` };
    } catch {
      return { exito: false, mensaje: 'No se pudo suscribir al viaje' };
    }
  }

  /** Pasajero/monitor deja de recibir actualizaciones de un viaje */
  @SubscribeMessage('desuscribir-viaje')
  async handleDesuscribirViaje(
    @MessageBody() data: { viajeId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`viaje-${data.viajeId}`);
    return { exito: true, mensaje: `Desuscrito del viaje ${data.viajeId}` };
  }

  /** Suscripción a todos los buses activos de una línea (vista mapa pasajero) */
  @SubscribeMessage('suscribir-linea')
  async handleSuscribirLinea(
    @MessageBody() data: { lineaId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await client.join(`linea-${data.lineaId}`);
      return { exito: true, mensaje: `Suscrito a la línea ${data.lineaId}` };
    } catch {
      return { exito: false, mensaje: 'No se pudo suscribir a la línea' };
    }
  }

  /** El conductor envía su posición GPS: se guarda en BD y se transmite a suscriptores */
  @SubscribeMessage('ubicacion-conductor')
  async handleUbicacionConductor(@MessageBody() dto: UbicacionDto) {
    try {
      const ubicacion = await this.viajesService.registrarUbicacion(dto);

      // Obtener lineaId y sindicatoId para emitir a salas del admin
      const info = await this.viajesService.obtenerInfoViajeParaEmision(dto.viajeId);
      const lineaId = info?.assignment?.internal?.lineId?.toString();
      const sindicatoId = info?.assignment?.syndicateId?.toString();

      const payload = {
        viajeId: dto.viajeId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        rumbo: dto.rumbo,
        velocidad: dto.velocidad,
        lineaId,
        sindicatoId,
        registradoEn: ubicacion.recordedAt,
      };

      // Emitir a sala del viaje específico (pasajeros que siguen el viaje)
      this.server.to(`viaje-${dto.viajeId}`).emit('ubicacion-actualizada', payload);

      // Emitir a sala de la línea (admin viendo esa línea)
      if (lineaId) this.server.to(`linea-${lineaId}`).emit('bus-actualizado', payload);

      // Emitir a sala del sindicato (admin viendo todo el sindicato)
      if (sindicatoId) this.server.to(`sindicato-${sindicatoId}`).emit('bus-actualizado', payload);

      // Emitir a sala global de admins
      this.server.to('admin-global').emit('bus-actualizado', payload);

      return { exito: true, mensaje: 'Ubicación registrada y transmitida' };
    } catch (error) {
      return { exito: false, mensaje: (error as Error).message };
    }
  }

  /** Admin se suscribe a un sindicato para ver todos sus buses en tiempo real */
  @SubscribeMessage('suscribir-sindicato')
  async handleSuscribirSindicato(
    @MessageBody() data: { sindicatoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`sindicato-${data.sindicatoId}`);
    return { exito: true, mensaje: `Suscrito al sindicato ${data.sindicatoId}` };
  }

  /** Admin se suscribe a la sala global para ver todos los buses */
  @SubscribeMessage('suscribir-admin-global')
  async handleSuscribirAdminGlobal(@ConnectedSocket() client: Socket) {
    await client.join('admin-global');
    return { exito: true, mensaje: 'Suscrito al canal global de admin' };
  }

  /** Desuscribir de sindicato */
  @SubscribeMessage('desuscribir-sindicato')
  async handleDesuscribirSindicato(
    @MessageBody() data: { sindicatoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`sindicato-${data.sindicatoId}`);
    return { exito: true };
  }

  /** Finaliza un viaje desde el conductor y notifica a todos los suscriptores */
  @SubscribeMessage('finalizar-viaje')
  async handleFinalizarViaje(
    @MessageBody() data: { viajeId: string; razonFin?: string; velocidadPromedio?: number },
  ) {
    try {
      const viaje = await this.viajesService.finalizar(data.viajeId, {
        razonFin: data.razonFin as any,
        velocidadPromedio: data.velocidadPromedio,
      });

      this.server.to(`viaje-${data.viajeId}`).emit('viaje-finalizado', {
        viajeId: data.viajeId,
        estado: viaje.status,
        razonFin: viaje.endReason,
        finalizadoEn: viaje.finishedAt,
      });

      return { exito: true, mensaje: 'Viaje finalizado correctamente' };
    } catch (error) {
      return { exito: false, mensaje: (error as Error).message };
    }
  }

  /** Emite actualización de ubicación a suscriptores de una línea (llamado desde service) */
  emitirUbicacionALinea(lineaId: string, payload: any) {
    this.server.to(`linea-${lineaId}`).emit('bus-actualizado', payload);
  }
}
