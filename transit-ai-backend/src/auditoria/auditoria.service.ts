import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrarBitacoraDto } from './dto/filtrar-bitacora.dto';
import { CrearBitacoraDto } from './dto/crear-bitacora.dto';

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra una acción en la bitácora
   */
  async registrarAccion(dto: CrearBitacoraDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId ? BigInt(dto.userId) : undefined,
        userRole: dto.userRole,
        sindicatoId: dto.sindicatoId ? BigInt(dto.sindicatoId) : undefined,
        action: dto.action,
        tableName: dto.tableName,
        recordId: BigInt(dto.recordId),
        recordName: dto.recordName,
        previousData: dto.previousData,
        newData: dto.newData,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
      include: {
        user: true,
        syndicate: true,
      },
    });
  }

  /**
   * Obtiene la bitácora filtrada
   */
  async obtenerBitacora(filtros: FiltrarBitacoraDto, sindicatoIdUsuario?: string, esAdmin?: boolean) {
    const where: any = {
      createdAt: {
        gte: filtros.desde ? new Date(filtros.desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
        lte: filtros.hasta ? new Date(filtros.hasta) : new Date(),
      },
    };

    // Si NO es SUPERADMIN, solo ver su sindicato
    if (!esAdmin && sindicatoIdUsuario) {
      where.sindicatoId = BigInt(sindicatoIdUsuario);
    } else if (filtros.sindicatoId && esAdmin) {
      // Si es SUPERADMIN y selecciona un sindicato específico
      where.sindicatoId = BigInt(filtros.sindicatoId);
    }

    if (filtros.tableName) {
      where.tableName = filtros.tableName;
    }

    if (filtros.accion) {
      where.action = filtros.accion;
    }

    if (filtros.usuarioId) {
      where.userId = BigInt(filtros.usuarioId);
    }

    if (filtros.rol) {
      where.userRole = filtros.rol;
    }

    const registros = await this.prisma.auditLog.findMany({
      where,
      include: {
        user: true,
        syndicate: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (filtros.pagina - 1) * (filtros.limite || 20),
      take: filtros.limite || 20,
    });

    const total = await this.prisma.auditLog.count({ where });

    return {
      registros,
      total,
      pagina: filtros.pagina,
      limite: filtros.limite || 20,
      totalPaginas: Math.ceil(total / (filtros.limite || 20)),
    };
  }

  /**
   * Obtiene resumen de acciones por tabla
   */
  async obtenerResumenAcciones(sindicatoId?: string, esAdmin?: boolean) {
    const where: any = {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    };

    if (!esAdmin && sindicatoId) {
      where.sindicatoId = BigInt(sindicatoId);
    }

    return this.prisma.auditLog.groupBy({
      by: ['action', 'tableName'],
      where,
      _count: true,
    });
  }
}
