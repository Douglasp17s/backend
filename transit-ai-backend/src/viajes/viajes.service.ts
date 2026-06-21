import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IniciarViajeDto } from './dto/iniciar-viaje.dto';
import { UbicacionDto } from './dto/ubicacion.dto';
import { FinalizarViajeDto } from './dto/finalizar-viaje.dto';

@Injectable()
export class ViajesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerActivos(filtros?: { sindicatoId?: string; lineaId?: string; conductorId?: string }) {
    return this.prisma.trip.findMany({
      where: {
        status: 'IN_PROGRESS',
        ...(filtros?.sindicatoId ? { assignment: { syndicateId: BigInt(filtros.sindicatoId) } } : {}),
        ...(filtros?.lineaId ? { assignment: { internal: { lineId: BigInt(filtros.lineaId) } } } : {}),
        ...(filtros?.conductorId ? { driverId: BigInt(filtros.conductorId) } : {}),
      },
      include: {
        assignment: {
          include: {
            driver: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
            internal: {
              select: { id: true, internalNumber: true, licensePlate: true, model: true,
                line: { select: { id: true, name: true, code: true, color: true } },
              },
            },
            route: { select: { id: true, name: true, direction: true } },
            syndicate: { select: { id: true, name: true } },
          },
        },
        locations: { orderBy: { recordedAt: 'desc' }, take: 1 },
      },
    });
  }

  async obtenerInfoViajeParaEmision(viajeId: string) {
    return this.prisma.trip.findUnique({
      where: { id: BigInt(viajeId) },
      select: {
        id: true,
        assignment: {
          select: {
            syndicateId: true,
            internal: { select: { lineId: true } },
          },
        },
      },
    });
  }

  async obtenerPorId(id: string) {
    const viaje = await this.prisma.trip.findUnique({
      where: { id: BigInt(id) },
      include: {
        assignment: {
          include: {
            driver: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
            internal: { select: { id: true, internalNumber: true, licensePlate: true, model: true, capacity: true } },
            route: { select: { id: true, name: true, direction: true } },
            shift: { select: { id: true, name: true } },
          },
        },
        locations: {
          orderBy: { recordedAt: 'desc' },
          take: 20,
        },
        incidents: {
          where: { status: { not: 'CLOSED' } },
          select: { id: true, type: true, status: true, reportedAt: true },
        },
      },
    });

    if (!viaje) throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    return viaje;
  }

  async iniciar(dto: IniciarViajeDto) {
    const asignacion = await this.prisma.dailyAssignment.findUnique({
      where: { id: BigInt(dto.asignacionId) },
    });

    if (!asignacion) throw new NotFoundException(`Asignación con ID ${dto.asignacionId} no encontrada`);
    if (asignacion.status === 'CANCELLED') throw new BadRequestException('La asignación está cancelada');

    return this.prisma.trip.create({
      data: {
        assignmentId: BigInt(dto.asignacionId),
        driverId: asignacion.driverId,
        busId: asignacion.busId,
        routeId: asignacion.routeId,
        status: 'IN_PROGRESS',
      },
    });
  }

  async finalizar(id: string, dto: FinalizarViajeDto) {
    const viaje = await this.prisma.trip.findUnique({
      where: { id: BigInt(id) },
      select: { status: true },
    });

    if (!viaje) throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    if (viaje.status !== 'IN_PROGRESS') throw new BadRequestException(`El viaje ya está en estado ${viaje.status}`);

    return this.prisma.trip.update({
      where: { id: BigInt(id) },
      data: {
        status: 'COMPLETED',
        endReason: dto.razonFin ?? 'COMPLETED_ROUTE',
        averageSpeed: dto.velocidadPromedio,
        finishedAt: new Date(),
      },
    });
  }

  async cancelar(id: string) {
    const viaje = await this.prisma.trip.findUnique({
      where: { id: BigInt(id) },
      select: { status: true },
    });

    if (!viaje) throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    if (viaje.status !== 'IN_PROGRESS') throw new BadRequestException(`El viaje ya está en estado ${viaje.status}`);

    return this.prisma.trip.update({
      where: { id: BigInt(id) },
      data: { status: 'CANCELLED', endReason: 'OTHER', finishedAt: new Date() },
    });
  }

  async registrarUbicacion(dto: UbicacionDto) {
    const viaje = await this.prisma.trip.findUnique({
      where: { id: BigInt(dto.viajeId) },
      select: { status: true },
    });

    if (!viaje) throw new NotFoundException(`Viaje con ID ${dto.viajeId} no encontrado`);
    if (viaje.status !== 'IN_PROGRESS') throw new BadRequestException('Solo se pueden registrar ubicaciones en viajes activos');

    return this.prisma.driverLocation.create({
      data: {
        tripId: BigInt(dto.viajeId),
        latitude: dto.latitud,
        longitude: dto.longitud,
        heading: dto.rumbo,
        speed: dto.velocidad,
        accuracyMeters: dto.precisionMetros,
        batteryLevel: dto.nivelBateria,
      },
    });
  }

  async obtenerUltimaUbicacion(viajeId: string) {
    return this.prisma.driverLocation.findFirst({
      where: { tripId: BigInt(viajeId) },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
