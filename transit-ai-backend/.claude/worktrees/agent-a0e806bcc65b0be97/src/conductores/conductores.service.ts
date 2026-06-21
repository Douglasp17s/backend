import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearConductorDto } from './dto/crear-conductor.dto';
import { ActualizarConductorDto } from './dto/actualizar-conductor.dto';
import { ActualizarCredencialDto } from './dto/actualizar-credencial.dto';

@Injectable()
export class ConductoresService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos(sindicatoId?: string, lineaId?: string) {
    return this.prisma.driver.findMany({
      where: {
        deletedAt: null,
        active: true,
        ...(sindicatoId ? { syndicateId: BigInt(sindicatoId) } : {}),
        ...(lineaId ? { lineId: BigInt(lineaId) } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
        syndicate: { select: { id: true, name: true } },
        line: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const conductor = await this.prisma.driver.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
        syndicate: { select: { id: true, name: true } },
        line: { select: { id: true, name: true, code: true, color: true } },
      },
    });

    if (!conductor) throw new NotFoundException(`Conductor con ID ${id} no encontrado`);
    return conductor;
  }

  async crear(dto: CrearConductorDto) {
    return this.prisma.driver.create({
      data: {
        userId: BigInt(dto.usuarioId),
        syndicateId: BigInt(dto.sindicatoId),
        lineId: dto.lineaId ? BigInt(dto.lineaId) : null,
        nationalId: dto.cedulaIdentidad,
        nationalIdExtension: dto.extensionCI,
        licenseNumber: dto.numeroLicencia,
        licenseCategory: dto.categoriaLicencia,
        licenseExpirationDate: new Date(dto.vencimientoLicencia),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async actualizar(id: string, dto: ActualizarConductorDto) {
    await this.obtenerPorId(id);
    return this.prisma.driver.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.lineaId !== undefined && { lineId: dto.lineaId ? BigInt(dto.lineaId) : null }),
        ...(dto.numeroLicencia !== undefined && { licenseNumber: dto.numeroLicencia }),
        ...(dto.categoriaLicencia !== undefined && { licenseCategory: dto.categoriaLicencia }),
        ...(dto.vencimientoLicencia !== undefined && { licenseExpirationDate: new Date(dto.vencimientoLicencia) }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async actualizarCredencial(id: string, dto: ActualizarCredencialDto) {
    await this.obtenerPorId(id);
    return this.prisma.driver.update({
      where: { id: BigInt(id) },
      data: { credentialStatus: dto.estadoCredencial },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.driver.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
