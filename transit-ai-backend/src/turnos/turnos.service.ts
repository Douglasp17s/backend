import { Injectable, NotFoundException } from '@nestjs/common';
import { Turno } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearTurnoDto } from './dto/crear-turno.dto';
import { ActualizarTurnoDto } from './dto/actualizar-turno.dto';

@Injectable()
export class TurnosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos() {
    return this.prisma.shift.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { assignments: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const turno = await this.prisma.shift.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        assignments: {
          where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          take: 10,
          select: { id: true, date: true, status: true },
        },
      },
    });
    if (!turno) throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    return turno;
  }

  async obtenerDisponibles(fecha?: string) {
    return this.prisma.shift.findMany({
      where: {
        deletedAt: null,
        active: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async obtenerPorConductor(conductorId: string) {
    const asignaciones = await this.prisma.dailyAssignment.findMany({
      where: { driverId: BigInt(conductorId) },
      include: { shift: true },
      orderBy: { date: 'desc' },
    });
    return { ok: true, data: asignaciones.filter(a => a.shift).map(a => a.shift).filter(Boolean) };
  }

  async crear(dto: CrearTurnoDto) {
    return this.prisma.shift.create({
      data: {
        name: dto.nombre as Turno,
        daysOfWeek: dto.diasSemana,
        startTime: new Date(`1970-01-01T${dto.horaInicio}`),
        endTime: new Date(`1970-01-01T${dto.horaFin}`),
        expectedRounds: dto.vueltasEsperadas,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarTurnoDto) {
    await this.obtenerPorId(id);
    return this.prisma.shift.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.nombre !== undefined && { name: dto.nombre as Turno }),
        ...(dto.diasSemana !== undefined && { daysOfWeek: dto.diasSemana }),
        ...(dto.horaInicio !== undefined && { startTime: new Date(`1970-01-01T${dto.horaInicio}`) }),
        ...(dto.horaFin !== undefined && { endTime: new Date(`1970-01-01T${dto.horaFin}`) }),
        ...(dto.vueltasEsperadas !== undefined && { expectedRounds: dto.vueltasEsperadas }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.shift.update({
      where: { id: BigInt(id) },
      data: { active: false },
    });
  }
}
