import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParadasService } from '../paradas/paradas.service';
import { CalcularTransbordoDto } from './dto/calcular-transbordo.dto';
import { AsignarTransbordoDto } from './dto/asignar-transbordo.dto';

@Injectable()
export class TrasboardosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paradasService: ParadasService,
  ) {}

  async obtenerTodos() {
    const trasbordos = await this.prisma.dailyAssignment.findMany({
      where: { notes: { contains: 'Transbordo' } },
    });
    return { ok: true, data: trasbordos };
  }

  async obtenerPorId(id: string) {
    const trasbordo = await this.prisma.dailyAssignment.findFirst({
      where: {
        id: BigInt(id),
        notes: { contains: 'Transbordo' },
      },
    });
    if (!trasbordo) {
      throw new NotFoundException('Transbordo no encontrado');
    }
    return { ok: true, data: trasbordo };
  }

  async obtenerPendientes() {
    const trasbordos = await this.prisma.dailyAssignment.findMany({
      where: {
        status: 'SCHEDULED',
        notes: { contains: 'Transbordo' },
      },
    });
    return { ok: true, data: trasbordos };
  }

  async decidirTransbordo(id: string, body: any) {
    const trasbordo = await this.prisma.dailyAssignment.findFirst({
      where: { id: BigInt(id) },
    });
    if (!trasbordo) {
      throw new NotFoundException('Transbordo no encontrado');
    }

    const actualizado = await this.prisma.dailyAssignment.update({
      where: { id: BigInt(id) },
      data: { status: body.estado || 'ACTIVE' },
    });
    return { ok: true, data: actualizado };
  }

  async eliminarTransbordo(id: string) {
    const trasbordo = await this.prisma.dailyAssignment.findFirst({
      where: { id: BigInt(id) },
    });
    if (!trasbordo) {
      throw new NotFoundException('Transbordo no encontrado');
    }

    await this.prisma.dailyAssignment.delete({ where: { id: BigInt(id) } });
    return { ok: true, data: { id } };
  }

  async calcularTransbordosDisponibles(dto: CalcularTransbordoDto): Promise<any[]> {
    const paradasCercanas = await this.paradasService.obtenerCercanasAPunto(
      dto.latitudActual,
      dto.longitudActual,
      dto.radioKm ?? 1,
    );

    if (!paradasCercanas.length) {
      return [];
    }

    return [];
  }

  async asignarTransbordo(dto: AsignarTransbordoDto) {
    const conductor = await this.prisma.driver.findFirst({
      where: { id: BigInt(dto.conductorId) },
    });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');

    const nuevoMicro = await this.prisma.internal.findFirst({
      where: { id: BigInt(dto.nuevoMicroId) },
    });
    if (!nuevoMicro) throw new NotFoundException('Micro no encontrado');

    const asignacionActual = await this.prisma.dailyAssignment.findFirst({
      where: { driverId: BigInt(dto.conductorId) },
    });

    if (!asignacionActual) {
      throw new BadRequestException('No hay asignación activa para este conductor');
    }

    const nuevaAsignacion = await this.prisma.dailyAssignment.create({
      data: {
        syndicateId: asignacionActual.syndicateId,
        driverId: BigInt(dto.conductorId),
        busId: BigInt(dto.nuevoMicroId),
        routeId: asignacionActual.routeId,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        status: 'SCHEDULED',
        notes: `Transbordo desde micro ${dto.microActualId}. Descanso adicional: ${dto.tiempoDescansoAdicionalMin || 0}min`,
      },
    });

    return {
      ok: true,
      data: {
        nuevaAsignacionId: nuevaAsignacion.id.toString(),
        microActualId: dto.microActualId,
        nuevoMicroId: dto.nuevoMicroId,
        conductorId: dto.conductorId,
        descansoAdicional: dto.tiempoDescansoAdicionalMin || 0,
      },
    };
  }

  async cambiarEstadoInterno(
    internalId: string,
    nuevoEstado: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | 'OUT_OF_SERVICE',
  ) {
    const micro = await this.prisma.internal.findFirst({
      where: { id: BigInt(internalId) },
    });

    if (!micro) throw new NotFoundException('Micro no encontrado');

    await this.prisma.internal.update({
      where: { id: BigInt(internalId) },
      data: { operationalStatus: nuevoEstado },
    });

    return {
      ok: true,
      data: {
        microId: internalId,
        nuevoEstado: nuevoEstado,
      },
    };
  }
}
