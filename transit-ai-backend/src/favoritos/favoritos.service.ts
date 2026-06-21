import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearFavoritoDto } from './dto/crear-favorito.dto';
import { ActualizarFavoritoDto } from './dto/actualizar-favorito.dto';

@Injectable()
export class FavoritosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerPorUsuario(usuarioId: string) {
    return this.prisma.favoriteTrip.findMany({
      where: { userId: BigInt(usuarioId), active: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const favorito = await this.prisma.favoriteTrip.findFirst({
      where: { id: BigInt(id) },
      include: { user: { select: { id: true, name: true } } },
    });
    if (!favorito) throw new NotFoundException(`Favorito con ID ${id} no encontrado`);
    return favorito;
  }

  async crear(dto: CrearFavoritoDto) {
    return this.prisma.favoriteTrip.create({
      data: {
        userId: BigInt(dto.usuarioId),
        alias: dto.alias,
        originLatitude: dto.latitudOrigen,
        originLongitude: dto.longitudOrigen,
        originLabel: dto.etiquetaOrigen,
        destinationLatitude: dto.latitudDestino,
        destinationLongitude: dto.longitudDestino,
        destinationLabel: dto.etiquetaDestino,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarFavoritoDto) {
    await this.obtenerPorId(id);
    return this.prisma.favoriteTrip.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.alias !== undefined && { alias: dto.alias }),
        ...(dto.latitudOrigen !== undefined && { originLatitude: dto.latitudOrigen }),
        ...(dto.longitudOrigen !== undefined && { originLongitude: dto.longitudOrigen }),
        ...(dto.etiquetaOrigen !== undefined && { originLabel: dto.etiquetaOrigen }),
        ...(dto.latitudDestino !== undefined && { destinationLatitude: dto.latitudDestino }),
        ...(dto.longitudDestino !== undefined && { destinationLongitude: dto.longitudDestino }),
        ...(dto.etiquetaDestino !== undefined && { destinationLabel: dto.etiquetaDestino }),
        ...(dto.activo !== undefined && { active: dto.activo }),
      },
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.favoriteTrip.update({
      where: { id: BigInt(id) },
      data: { active: false },
    });
  }
}
