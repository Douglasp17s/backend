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
import { IncidentesService } from './incidentes.service';
import { CrearIncidenteDto } from './dto/crear-incidente.dto';
import { RevisarIncidenteDto } from './dto/revisar-incidente.dto';

@WebSocketGateway({ namespace: 'incidentes', cors: { origin: '*' } })
export class IncidentesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly incidentesService: IncidentesService) {}

  handleConnection(client: Socket) {
    console.log(`[Incidentes WS] Conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Incidentes WS] Desconectado: ${client.id}`);
  }

  /** Operador/admin se une a la sala de incidentes de un sindicato */
  @SubscribeMessage('suscribir-sindicato')
  async handleSuscribirSindicato(
    @MessageBody() data: { sindicatoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`sindicato-${data.sindicatoId}`);
    return {
      exito: true,
      mensaje: `Suscrito a incidentes del sindicato ${data.sindicatoId}`,
    };
  }

  /** Conductor reporta un incidente desde el móvil vía WebSocket */
  @SubscribeMessage('reportar-incidente')
  async handleReportarIncidente(@MessageBody() dto: CrearIncidenteDto) {
    try {
      const incidente = await this.incidentesService.crear(dto);

      // Notificar a todos los admins/operadores
      this.server.emit('nuevo-incidente', {
        id: incidente.id?.toString(),
        viajeId: incidente.tripId?.toString(),
        tipo: incidente.type,
        descripcion: incidente.description,
        latitud: incidente.latitude,
        longitud: incidente.longitude,
        reportadoEn: incidente.reportedAt,
      });

      return {
        exito: true,
        mensaje: 'Incidente reportado correctamente',
        datos: incidente,
      };
    } catch (error) {
      return { exito: false, mensaje: (error as Error).message };
    }
  }

  /** Admin revisa un incidente y notifica a los conductores relevantes */
  @SubscribeMessage('revisar-incidente')
  async handleRevisarIncidente(
    @MessageBody() data: { incidenteId: string; dto: RevisarIncidenteDto },
  ) {
    try {
      const incidente = await this.incidentesService.revisar(
        data.incidenteId,
        data.dto,
      );

      this.server.emit('incidente-revisado', {
        id: incidente.id?.toString(),
        estado: incidente.status,
        revisadoEn: incidente.reviewedAt,
      });

      return { exito: true, mensaje: 'Incidente revisado correctamente' };
    } catch (error) {
      return { exito: false, mensaje: (error as Error).message };
    }
  }

  /** Emite un nuevo incidente a suscriptores de una sala (llamado desde controller REST) */
  emitirNuevoIncidente(incidente: any) {
    this.server.emit('nuevo-incidente', incidente);
  }
}
