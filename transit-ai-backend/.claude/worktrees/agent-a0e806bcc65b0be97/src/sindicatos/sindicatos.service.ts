import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSindicatoDto } from './dto/crear-sindicato.dto';
import { ActualizarSindicatoDto } from './dto/actualizar-sindicato.dto';

@Injectable()
export class SindicatosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos() {
    return this.prisma.syndicate.findMany({
      where: { active: true },
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
