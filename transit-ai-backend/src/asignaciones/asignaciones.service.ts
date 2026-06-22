import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { ActualizarAsignacionDto } from './dto/actualizar-asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos(sindicatoId?: string, fecha?: string, conductorId?: string) {
    return this.prisma.dailyAssignment.findMany({
      where: {
        ...(sindicatoId ? { syndicateId: BigInt(sindicatoId) } : {}),
        ...(fecha ? { date: new Date(fecha) } : {}),
        ...(conductorId ? { driverId: BigInt(conductorId) } : {}),
      },
      include: {
        driver: { include: { user: { select: { id: true, name: true } } } },
        internal: { select: { id: true, internalNumber: true, licensePlate: true } },
        route: { select: { id: true, name: true, direction: true } },
        shift: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const asignacion = await this.prisma.dailyAssignment.findFirst({
      where: { id: BigInt(id) },
      include: {
        driver: { include: { user: { select: { id: true, name: true, email: true } } } },
        internal: { select: { id: true, internalNumber: true, licensePlate: true, model: true } },
        route: { select: { id: true, name: true, direction: true } },
        shift: { select: { id: true, name: true, daysOfWeek: true } },
        trips: { select: { id: true, status: true, startedAt: true, finishedAt: true } },
      },
    });
    if (!asignacion) throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    return asignacion;
  }

  async crear(dto: CrearAsignacionDto) {
    return this.prisma.dailyAssignment.create({
      data: {
        syndicateId: BigInt(dto.sindicatoId),
        driverId: BigInt(dto.conductorId),
        busId: BigInt(dto.busId),
        routeId: BigInt(dto.rutaId),
        shiftId: dto.turnoId ? BigInt(dto.turnoId) : null,
        date: new Date(dto.fecha),
        startTime: new Date(`1970-01-01T${dto.horaInicio}`),
        endTime: new Date(`1970-01-01T${dto.horaFin}`),
        notes: dto.notas,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarAsignacionDto) {
    await this.obtenerPorId(id);
    return this.prisma.dailyAssignment.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.conductorId !== undefined && { driverId: BigInt(dto.conductorId) }),
        ...(dto.busId !== undefined && { busId: BigInt(dto.busId) }),
        ...(dto.rutaId !== undefined && { routeId: BigInt(dto.rutaId) }),
        ...(dto.turnoId !== undefined && { shiftId: dto.turnoId ? BigInt(dto.turnoId) : null }),
        ...(dto.fecha !== undefined && { date: new Date(dto.fecha) }),
        ...(dto.horaInicio !== undefined && { startTime: new Date(`1970-01-01T${dto.horaInicio}`) }),
        ...(dto.horaFin !== undefined && { endTime: new Date(`1970-01-01T${dto.horaFin}`) }),
        ...(dto.vueltasReales !== undefined && { actualRounds: dto.vueltasReales }),
        ...(dto.estado !== undefined && { status: dto.estado }),
        ...(dto.notas !== undefined && { notes: dto.notas }),
      },
    });
  }

  async obtenerMiAsignacionHoy(conductorUserId: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Primero busca el driver por userId
    const conductor = await this.prisma.driver.findUnique({
      where: { userId: BigInt(conductorUserId) },
      select: { id: true },
    });

    if (!conductor) return null;

    // Busca asignación para este driver
    return this.prisma.dailyAssignment.findFirst({
      where: {
        driverId: conductor.id,
        date: { gte: hoy, lt: manana },
        status: { not: 'CANCELLED' },
      },
      include: {
        driver: { include: { user: { select: { id: true, name: true } } } },
        internal: { select: { id: true, internalNumber: true, licensePlate: true, model: true } },
        route: {
          select: {
            id: true, name: true, direction: true,
            routeRecording: {
              select: {
                id: true,
                recordedPoints: true,
                status: true
              }
            },
          },
        },
        shift: { select: { id: true, name: true } },
        trips: {
          where: { status: 'IN_PROGRESS' },
          select: { id: true, status: true, startedAt: true },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.dailyAssignment.update({ where: { id: BigInt(id) }, data: { status: 'CANCELLED' } });
  }
}
