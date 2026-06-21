import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async obtenerTodos(rol?: UserRole, sindicatoId?: string) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        active: true,
        ...(rol ? { role: rol } : {}),
        ...(sindicatoId ? { syndicateId: BigInt(sindicatoId) } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        active: true,
        syndicateId: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const usuario = await this.prisma.user.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        syndicate: { select: { id: true, name: true } },
        driver: { select: { id: true, credentialStatus: true, lineId: true } },
      },
    });

    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }

  async crear(dto: CrearUsuarioDto) {
    const hash = await bcrypt.hash(dto.contrasena, 10);
    return this.prisma.user.create({
      data: {
        syndicateId: dto.sindicatoId ? BigInt(dto.sindicatoId) : null,
        email: dto.email,
        passwordHash: hash,
        name: dto.nombre,
        phone: dto.telefono,
        avatarUrl: dto.avatarUrl,
        role: dto.rol ?? 'PASSENGER',
        createdById: dto.creadoPorId ? BigInt(dto.creadoPorId) : null,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto) {
    await this.obtenerPorId(id);
    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.nombre !== undefined && { name: dto.nombre }),
        ...(dto.telefono !== undefined && { phone: dto.telefono }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.rol !== undefined && { role: dto.rol }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
      select: { id: true, name: true, email: true, role: true, active: true, updatedAt: true },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), active: false },
      select: { id: true, name: true, email: true, deletedAt: true },
    });
  }
}
