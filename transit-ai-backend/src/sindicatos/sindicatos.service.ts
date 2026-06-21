import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSindicatoDto } from './dto/crear-sindicato.dto';
import { ActualizarSindicatoDto } from './dto/actualizar-sindicato.dto';

@Injectable()
export class SindicatosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos() {
    return this.prisma.syndicate.findMany({
      where: {},
      include: {
        _count: { select: { drivers: true, buses: true, lines: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const sindicato = await this.prisma.syndicate.findUnique({
      where: { id: BigInt(id) },
      include: {
        users: { where: { active: true }, select: { id: true, name: true, role: true } },
        lines: { where: { deletedAt: null }, select: { id: true, name: true, code: true } },
        _count: { select: { drivers: true, buses: true } },
      },
    });

    if (!sindicato) throw new NotFoundException(`Sindicato con ID ${id} no encontrado`);
    return sindicato;
  }

  async obtenerLineas(id: string) {
    await this.obtenerPorId(id);
    const lineas = await this.prisma.busLine.findMany({
      where: { syndicateId: BigInt(id), deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return { ok: true, data: lineas };
  }

  async obtenerConductores(id: string) {
    await this.obtenerPorId(id);
    const conductores = await this.prisma.driver.findMany({
      where: { syndicateId: BigInt(id), active: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { ok: true, data: conductores };
  }

  async obtenerEstadisticas(id: string) {
    await this.obtenerPorId(id);
    const [totalConductores, totalBuses, totalLineas, totalRutas] = await Promise.all([
      this.prisma.driver.count({ where: { syndicateId: BigInt(id), active: true } }),
      this.prisma.internal.count({ where: { syndicateId: BigInt(id), active: true } }),
      this.prisma.busLine.count({ where: { syndicateId: BigInt(id), deletedAt: null } }),
      this.prisma.route.count({ where: { line: { syndicateId: BigInt(id) }, active: true } }),
    ]);
    return {
      ok: true,
      data: {
        totalConductores,
        totalBuses,
        totalLineas,
        totalRutas,
      },
    };
  }

  async crear(dto: CrearSindicatoDto) {
    return this.prisma.syndicate.create({
      data: {
        name: dto.nombre,
        Nit: dto.nit,
        legalRepresentative: dto.representanteLegal,
        contactPhone: dto.telefonoContacto,
        contactEmail: dto.emailContacto,
        address: dto.direccion,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarSindicatoDto) {
    await this.obtenerPorId(id);
    return this.prisma.syndicate.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.nombre !== undefined && { name: dto.nombre }),
        ...(dto.nit !== undefined && { Nit: dto.nit }),
        ...(dto.representanteLegal !== undefined && { legalRepresentative: dto.representanteLegal }),
        ...(dto.telefonoContacto !== undefined && { contactPhone: dto.telefonoContacto }),
        ...(dto.emailContacto !== undefined && { contactEmail: dto.emailContacto }),
        ...(dto.direccion !== undefined && { address: dto.direccion }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.estado !== undefined && { status: dto.estado }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.syndicate.update({
      where: { id: BigInt(id) },
      data: { active: false, status: 'INACTIVE' },
    });
  }
}
