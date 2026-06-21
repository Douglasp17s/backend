import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecargarDto, PagarDto } from './dto';

@Injectable()
export class BilleteraService {
  constructor(private prisma: PrismaService) {}

  async obtenerSaldo(usuarioId: string) {
    const billetera = await this.prisma.billetera.findUnique({
      where: { usuarioId },
      include: { usuario: { select: { nombre: true, correo: true } } },
    });

    if (!billetera) {
      throw new BadRequestException('Billetera no encontrada');
    }

    return {
      id: billetera.id,
      saldoBs: billetera.saldoBs,
      saldoUSD: billetera.saldoUSD,
      usuario: billetera.usuario,
      ultimaActualizacion: billetera.updatedAt,
    };
  }

  async recargar(usuarioId: string, dto: RecargarDto) {
    const billetera = await this.prisma.billetera.findUnique({
      where: { usuarioId },
    });

    if (!billetera) {
      throw new BadRequestException('Billetera no encontrada');
    }

    // Tasa de cambio ejemplo (en prod usar API externa)
    const tasaCambio = 6.96;
    const montoUSD = dto.monto / tasaCambio;

    const actualizada = await this.prisma.billetera.update({
      where: { usuarioId },
      data: {
        saldoBs: {
          increment: dto.monto,
        },
        saldoUSD: {
          increment: montoUSD,
        },
      },
    });

    // Registrar transacción
    await this.prisma.billeteraTransaccion.create({
      data: {
        billeteraId: billetera.id,
        tipo: 'RECARGA',
        montoBs: dto.monto,
        montoUSD,
        estado: 'COMPLETADA',
        referencia: `RECARGA-${Date.now()}`,
        descripcion: 'Recarga vía Stripe',
      },
    });

    return {
      ok: true,
      saldoBs: actualizada.saldoBs,
      saldoUSD: actualizada.saldoUSD,
      montoCargado: dto.monto,
    };
  }

  async pagar(usuarioId: string, dto: PagarDto) {
    const billetera = await this.prisma.billetera.findUnique({
      where: { usuarioId },
    });

    if (!billetera) {
      throw new BadRequestException('Billetera no encontrada');
    }

    // Obtener tarifa de la línea (simulado)
    const montoBs = dto.montoBs || 2.5;

    if (billetera.saldoBs < montoBs) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const actualizada = await this.prisma.billetera.update({
      where: { usuarioId },
      data: {
        saldoBs: {
          decrement: montoBs,
        },
      },
    });

    // Registrar transacción
    await this.prisma.billeteraTransaccion.create({
      data: {
        billeteraId: billetera.id,
        tipo: 'PAGO',
        montoBs,
        montoUSD: montoBs / 6.96,
        estado: 'COMPLETADA',
        referencia: `PAGO-${Date.now()}`,
        descripcion: `Pago de pasaje - Línea ${dto.lineaId}`,
      },
    });

    return {
      ok: true,
      saldoRestante: actualizada.saldoBs,
      montoDescontado: montoBs,
      lineaId: dto.lineaId,
    };
  }

  async obtenerHistorial(usuarioId: string, limite: number = 20) {
    const billetera = await this.prisma.billetera.findUnique({
      where: { usuarioId },
    });

    if (!billetera) {
      throw new BadRequestException('Billetera no encontrada');
    }

    const transacciones = await this.prisma.billeteraTransaccion.findMany({
      where: { billeteraId: billetera.id },
      orderBy: { createdAt: 'desc' },
      take: limite,
      select: {
        id: true,
        tipo: true,
        montoBs: true,
        montoUSD: true,
        estado: true,
        descripcion: true,
        referencia: true,
        createdAt: true,
      },
    });

    return transacciones;
  }
}
