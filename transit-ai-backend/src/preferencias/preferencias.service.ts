import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPreferenciaDto } from './dto/actualizar-preferencia.dto';

@Injectable()
export class PreferenciasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerPorUsuario(usuarioId: string) {
    const preferencia = await this.prisma.userPreference.findUnique({
      where: { userId: BigInt(usuarioId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!preferencia) throw new NotFoundException(`Preferencias del usuario ${usuarioId} no encontradas`);
    return preferencia;
  }

  async upsert(usuarioId: string, dto: ActualizarPreferenciaDto) {
    return this.prisma.userPreference.upsert({
      where: { userId: BigInt(usuarioId) },
      create: {
        userId: BigInt(usuarioId),
        preferredCriteria: dto.criterioPreferido,
        maxWalkingMeters: dto.maxCaminataMetros ?? 500,
        maxTransfers: dto.maxTrasbordos ?? 2,
        learnedPatterns: dto.patronesAprendidos,
      },
      update: {
        ...(dto.criterioPreferido !== undefined && { preferredCriteria: dto.criterioPreferido }),
        ...(dto.maxCaminataMetros !== undefined && { maxWalkingMeters: dto.maxCaminataMetros }),
        ...(dto.maxTrasbordos !== undefined && { maxTransfers: dto.maxTrasbordos }),
        ...(dto.patronesAprendidos !== undefined && { learnedPatterns: dto.patronesAprendidos }),
      },
    });
  }

  async eliminar(usuarioId: string) {
    await this.obtenerPorUsuario(usuarioId);
    return this.prisma.userPreference.delete({ where: { userId: BigInt(usuarioId) } });
  }
}
