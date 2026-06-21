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

@WebSocketGateway({ namespace: 'notificaciones', cors: { origin: '*' } })
export class NotificacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`[Notificaciones WS] Conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Notificaciones WS] Desconectado: ${client.id}`);
  }

  /** Usuario se une a su sala personal para recibir notificaciones dirigidas */
  @SubscribeMessage('suscribir-usuario')
  async handleSuscribirUsuario(
    @MessageBody() data: { usuarioId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`usuario-${data.usuarioId}`);
    return {
      exito: true,
      mensaje: `Suscrito a notificaciones del usuario ${data.usuarioId}`,
    };
  }

  /** Suscripción a notificaciones por rol (DRIVER, PASSENGER, etc.) */
  @SubscribeMessage('suscribir-rol')
  async handleSuscribirRol(
    @MessageBody() data: { rol: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`rol-${data.rol}`);
    return {
      exito: true,
      mensaje: `Suscrito a notificaciones del rol ${data.rol}`,
    };
  }

  /** Envía notificación a un usuario específico */
  emitirAUsuario(usuarioId: string, notificacion: any) {
    this.server
      .to(`usuario-${usuarioId}`)
      .emit('nueva-notificacion', notificacion);
  }

  /** Broadcast a todos los usuarios de un rol */
  emitirARol(rol: string, notificacion: any) {
    this.server.to(`rol-${rol}`).emit('nueva-notificacion', notificacion);
  }

  /** Broadcast a todos los conectados */
  emitirATodos(notificacion: any) {
    this.server.emit('nueva-notificacion', notificacion);
  }
}
