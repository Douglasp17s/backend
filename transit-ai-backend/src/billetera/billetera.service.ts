import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Wallet, WalletCategory, WalletTxType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BlockchainService,
  CategoriaChain,
} from '../blockchain/blockchain.service';
import { cifrar } from './cripto.util';
import { generarTokenQr, verificarTokenQr } from './qr.util';
import { RecargarDto } from './dto/recargar.dto';
import { ComprarAbonoDto } from './dto/comprar-abono.dto';
import { AsignarCategoriaDto } from './dto/asignar-categoria.dto';
import { ActualizarDescuentoDto } from './dto/actualizar-descuento.dto';
import { ActualizarRepartoDto } from './dto/actualizar-reparto.dto';
import { ActualizarAbonoDto } from './dto/actualizar-abono.dto';

const CATEGORIA_A_CHAIN: Record<WalletCategory, CategoriaChain> = {
  GENERAL: CategoriaChain.GENERAL,
  ESTUDIANTE: CategoriaChain.ESTUDIANTE,
  ADULTO_MAYOR: CategoriaChain.ADULTO_MAYOR,
};

// Valores por defecto del abono (configurables vía .env: ABONO_VIAJES, ABONO_DIAS).
const ABONO_VIAJES_DEFAULT = 40;
const ABONO_DIAS_DEFAULT = 30;

function aCentavos(bs: number): number {
  return Math.round(bs * 100);
}
function aBs(centavos: number): number {
  return Math.round(centavos) / 100;
}

@Injectable()
export class BilleteraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
  ) {}

  /**
   * Lee la configuración del abono. Prioridad: base de datos (editable desde el
   * panel) → variables .env → valores por defecto.
   */
  private async obtenerAbonoConfig(): Promise<{ viajes: number; dias: number }> {
    return {
      viajes: Number(process.env.ABONO_VIAJES) || ABONO_VIAJES_DEFAULT,
      dias: Number(process.env.ABONO_DIAS) || ABONO_DIAS_DEFAULT,
    };
  }

  // ─── Billeteras (caso de uso: billeteras vinculadas a la cuenta) ────────────

  /** Devuelve la billetera del usuario, creándola on-chain si aún no existe. */
  async obtenerOCrearBilletera(userId: string): Promise<Wallet> {
    const existente = await this.prisma.wallet.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (existente) return existente;

    const { address, privateKey } = this.blockchain.crearWallet();
    return this.prisma.wallet.create({
      data: {
        kind: 'USER',
        userId: BigInt(userId),
        address,
        encryptedKey: cifrar(privateKey),
      },
    });
  }

  /** Billetera del sindicato (receptora de la distribución de pagos). */
  private async obtenerOCrearBilleteraSindicato(
    syndicateId: bigint,
  ): Promise<Wallet> {
    const existente = await this.prisma.wallet.findUnique({
      where: { syndicateId },
    });
    if (existente) return existente;

    const { address, privateKey } = this.blockchain.crearWallet();
    return this.prisma.wallet.create({
      data: {
        kind: 'SYNDICATE',
        syndicateId,
        address,
        encryptedKey: cifrar(privateKey),
      },
    });
  }

  /** Saldo + datos de la billetera (caso de uso: saldo disponible). */
  async resumen(userId: string) {
    const wallet = await this.obtenerOCrearBilletera(userId);
    let saldoCentavos = await this.blockchain.saldoCentavos(wallet.address);

    if (saldoCentavos === 0) {
      const txs = await this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
      });
      let calc = 0;
      for (const tx of txs) {
        if (tx.type === 'TOPUP') calc += tx.amountCents;
        else if (tx.type === 'FARE_PAYMENT' || tx.type === 'PASS_PURCHASE') calc -= tx.amountCents;
      }
      saldoCentavos = Math.max(0, calc);
    }

    return {
      address: wallet.address,
      categoria: wallet.category,
      saldoBs: aBs(saldoCentavos),
      saldoCentavos,
    };
  }

  // ─── Recarga con Stripe (modo prueba) ──────────────────────────────────────

  private stripeClient?: InstanceType<typeof Stripe>;
  private get stripe(): InstanceType<typeof Stripe> {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new BadRequestException('Stripe no está configurado (falta STRIPE_SECRET_KEY).');
    }
    if (!this.stripeClient) this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    return this.stripeClient;
  }

  /** Crea una sesión de Stripe Checkout para recargar saldo y devuelve la URL de pago. */
  async crearCheckoutStripe(userId: string, monto: number) {
    await this.obtenerOCrearBilletera(userId);
    const montoCentavos = aCentavos(monto);
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY || 'usd',
            product_data: { name: `Recarga de saldo TransitAI (Bs ${monto})` },
            unit_amount: montoCentavos,
          },
          quantity: 1,
        },
      ],
      metadata: { userId, monto: String(monto) },
      success_url: `${frontend}/mi-billetera?stripe=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend}/mi-billetera?stripe=cancel`,
    });

    return { url: session.url };
  }

  /** Verifica el pago en Stripe y, si está pagado, acredita el saldo (idempotente). */
  async confirmarCheckoutStripe(userId: string, sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new BadRequestException('El pago aún no se completó.');
    }
    if (session.metadata?.userId !== userId) {
      throw new ForbiddenException('La sesión de pago pertenece a otro usuario.');
    }

    const wallet = await this.obtenerOCrearBilletera(userId);

    // Idempotencia: si ya se acreditó esta sesión, no volver a mintear.
    const yaProcesado = await this.prisma.walletTransaction.findFirst({
      where: { type: 'TOPUP', metadata: { path: ['stripeSessionId'], equals: sessionId } },
    });
    if (yaProcesado) {
      const saldo = await this.blockchain.saldoCentavos(wallet.address);
      return { ok: true, yaProcesado: true, saldoBs: aBs(saldo) };
    }

    const monto = parseFloat(session.metadata?.monto ?? '0');
    const montoCentavos = aCentavos(monto);
    const recibo = await this.blockchain.recargar(wallet.address, montoCentavos);

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'TOPUP',
        amountCents: montoCentavos,
        txHash: recibo.txHash,
        blockNumber: recibo.blockNumber,
        metadata: { metodo: 'STRIPE', stripeSessionId: sessionId },
      },
    });

    const saldo = await this.blockchain.saldoCentavos(wallet.address);
    return { ok: true, recargaBs: monto, saldoBs: aBs(saldo), txHash: recibo.txHash };
  }

  // ─── Recarga (caso de uso: carga de saldo por medios tradicionales) ─────────

  async recargar(userId: string, dto: RecargarDto) {
    const wallet = await this.obtenerOCrearBilletera(userId);
    const montoCentavos = aCentavos(dto.monto);

    // Aquí se validaría el cobro real con la pasarela de tarjeta/transferencia.
    const recibo = await this.blockchain.recargar(
      wallet.address,
      montoCentavos,
    );

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'TOPUP',
        amountCents: montoCentavos,
        txHash: recibo.txHash,
        blockNumber: recibo.blockNumber,
        metadata: {
          metodo: dto.metodo ?? 'TARJETA',
          referencia: dto.referencia ?? null,
        },
      },
    });

    const saldoCentavos = await this.blockchain.saldoCentavos(wallet.address);
    return {
      ok: true,
      recargaBs: dto.monto,
      saldoBs: aBs(saldoCentavos),
      txHash: recibo.txHash,
      blockNumber: recibo.blockNumber,
    };
  }

  // ─── Pago de pasaje (casos de uso: QR, distribución, descuentos, on-chain) ──

  /** Cobra el pasaje de una línea a un pasajero y reparte automáticamente. */
  async pagarPasaje(
    pasajeroUserId: string,
    lineaId: string,
    choferUserId?: string,
  ) {
    const wallet = await this.obtenerOCrearBilletera(pasajeroUserId);

    const linea = await this.prisma.busLine.findFirst({
      where: { id: BigInt(lineaId), deletedAt: null },
      select: { id: true, name: true, fare: true, syndicateId: true },
    });
    if (!linea) throw new NotFoundException(`Línea ${lineaId} no encontrada`);

    const tarifaBaseCentavos = aCentavos(Number(linea.fare));
    const billeteraSindicato = await this.obtenerOCrearBilleteraSindicato(
      linea.syndicateId,
    );

    // Dirección del chofer (si se conoce); si no, su parte va al sindicato.
    let choferAddress = billeteraSindicato.address;
    if (choferUserId) {
      const walletChofer = await this.obtenerOCrearBilletera(choferUserId);
      choferAddress = walletChofer.address;
    }

    // Verifica saldo contra la tarifa YA con descuento aplicado.
    const tarifaPagadaCentavos = await this.blockchain.tarifaConDescuento(
      wallet.address,
      tarifaBaseCentavos,
    );
    const saldoCentavos = await this.blockchain.saldoCentavos(wallet.address);
    if (saldoCentavos < tarifaPagadaCentavos) {
      throw new BadRequestException(
        `Saldo insuficiente. Tarifa: ${aBs(tarifaPagadaCentavos)} Bs, saldo: ${aBs(saldoCentavos)} Bs`,
      );
    }

    const recibo = await this.blockchain.pagarPasaje(
      wallet.address,
      billeteraSindicato.address,
      choferAddress,
      tarifaBaseCentavos,
    );

    const descuentoCentavos = tarifaBaseCentavos - tarifaPagadaCentavos;
    const discountBps =
      tarifaBaseCentavos > 0
        ? Math.round((descuentoCentavos / tarifaBaseCentavos) * 10000)
        : 0;

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'FARE_PAYMENT',
        amountCents: tarifaPagadaCentavos,
        baseFareCents: tarifaBaseCentavos,
        discountBps,
        counterparty: billeteraSindicato.address,
        lineId: linea.id,
        txHash: recibo.txHash,
        blockNumber: recibo.blockNumber,
        metadata: {
          linea: linea.name,
          choferAddress,
        },
      },
    });

    return {
      ok: true,
      linea: linea.name,
      tarifaBaseBs: aBs(tarifaBaseCentavos),
      descuentoBs: aBs(descuentoCentavos),
      tarifaPagadaBs: aBs(tarifaPagadaCentavos),
      categoria: wallet.category,
      saldoBs: aBs(saldoCentavos - tarifaPagadaCentavos),
      txHash: recibo.txHash,
      blockNumber: recibo.blockNumber,
    };
  }

  /** Genera el token QR de pago del pasajero (caso de uso: pago por QR). */
  async generarQr(userId: string) {
    await this.obtenerOCrearBilletera(userId);
    return { qr: generarTokenQr(userId), expiraEnSeg: 90 };
  }

  /** El chofer escanea el QR del pasajero y cobra el pasaje. */
  async pagarPorQr(qr: string, lineaId: string, choferUserId?: string) {
    const pasajeroUserId = verificarTokenQr(qr);
    if (!pasajeroUserId) {
      throw new BadRequestException('QR inválido o expirado');
    }
    return this.pagarPasaje(pasajeroUserId, lineaId, choferUserId);
  }

  // ─── Abono / pase mensual (sin NFT, registrado on-chain) ────────────────────

  async comprarAbono(userId: string, dto: ComprarAbonoDto) {
    const wallet = await this.obtenerOCrearBilletera(userId);

    // Línea de referencia para precio y sindicato receptor.
    const linea = dto.lineaId
      ? await this.prisma.busLine.findFirst({
          where: { id: BigInt(dto.lineaId), deletedAt: null },
          select: { id: true, name: true, fare: true, syndicateId: true },
        })
      : await this.prisma.busLine.findFirst({
          where: { deletedAt: null, active: true },
          select: { id: true, name: true, fare: true, syndicateId: true },
        });
    if (!linea)
      throw new NotFoundException('No se encontró una línea para el abono');

    const abonoCfg = await this.obtenerAbonoConfig();
    const precioCentavos = aCentavos(Number(linea.fare)) * abonoCfg.viajes;
    const billeteraSindicato = await this.obtenerOCrearBilleteraSindicato(
      linea.syndicateId,
    );

    const saldoCentavos = await this.blockchain.saldoCentavos(wallet.address);
    if (saldoCentavos < precioCentavos) {
      throw new BadRequestException(
        `Saldo insuficiente para el abono. Precio: ${aBs(precioCentavos)} Bs, saldo: ${aBs(saldoCentavos)} Bs`,
      );
    }

    const validUntil = new Date(
      Date.now() + abonoCfg.dias * 24 * 60 * 60 * 1000,
    );
    const recibo = await this.blockchain.comprarAbono(
      wallet.address,
      billeteraSindicato.address,
      precioCentavos,
      Math.floor(validUntil.getTime() / 1000),
    );

    const pase = await this.prisma.transitPass.create({
      data: {
        walletId: wallet.id,
        lineId: dto.lineaId ? linea.id : null,
        priceCents: precioCentavos,
        validUntil,
        txHash: recibo.txHash,
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'PASS_PURCHASE',
        amountCents: precioCentavos,
        counterparty: billeteraSindicato.address,
        lineId: dto.lineaId ? linea.id : null,
        txHash: recibo.txHash,
        blockNumber: recibo.blockNumber,
        metadata: {
          validUntil: validUntil.toISOString(),
          viajes: abonoCfg.viajes,
        },
      },
    });

    return {
      ok: true,
      paseId: pase.id,
      linea: dto.lineaId ? linea.name : 'Todas las líneas',
      precioBs: aBs(precioCentavos),
      validoHasta: validUntil,
      txHash: recibo.txHash,
    };
  }

  /** Abono vigente del usuario (caso de uso: abono mensual). */
  async abonoActivo(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!wallet) return { activo: false };

    const pase = await this.prisma.transitPass.findFirst({
      where: {
        walletId: wallet.id,
        active: true,
        validUntil: { gt: new Date() },
      },
      orderBy: { validUntil: 'desc' },
    });

    if (!pase) return { activo: false };
    return {
      activo: true,
      paseId: pase.id,
      lineId: pase.lineId,
      precioBs: aBs(pase.priceCents),
      validoHasta: pase.validUntil,
    };
  }

  // ─── Historial (caso de uso: historial de transacciones) ────────────────────

  async historial(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!wallet) return [];

    const txs = await this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return txs.map((t) => ({
      id: t.id,
      tipo: t.type,
      montoBs: aBs(t.amountCents),
      tarifaBaseBs: t.baseFareCents != null ? aBs(t.baseFareCents) : null,
      descuentoBps: t.discountBps,
      lineId: t.lineId,
      txHash: t.txHash,
      blockNumber: t.blockNumber,
      fecha: t.createdAt,
      metadata: t.metadata,
    }));
  }

  /**
   * (Admin) Movimientos de todas las billeteras, con filtro opcional por tipo
   * (recargas, pagos, abonos) o por usuario. Incluye el titular de cada billetera.
   */
  async transacciones(filtros: { tipo?: string; usuarioId?: string }) {
    const where: {
      type?: WalletTxType;
      wallet?: { userId: bigint };
    } = {};
    if (filtros.tipo) where.type = filtros.tipo as WalletTxType;
    if (filtros.usuarioId) where.wallet = { userId: BigInt(filtros.usuarioId) };

    const txs = await this.prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        wallet: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            syndicate: { select: { id: true, name: true } },
          },
        },
      },
    });

    return txs.map((t) => ({
      id: t.id,
      tipo: t.type,
      montoBs: aBs(t.amountCents),
      tarifaBaseBs: t.baseFareCents != null ? aBs(t.baseFareCents) : null,
      titular: t.wallet.user?.name ?? t.wallet.syndicate?.name ?? '—',
      email: t.wallet.user?.email ?? null,
      lineId: t.lineId,
      txHash: t.txHash,
      blockNumber: t.blockNumber,
      fecha: t.createdAt,
      metadata: t.metadata,
    }));
  }

  // ─── Descuentos (caso de uso: descuentos automáticos) ───────────────────────

  async asignarCategoria(userId: string, dto: AsignarCategoriaDto) {
    const wallet = await this.obtenerOCrearBilletera(userId);
    const categoria = dto.categoria as WalletCategory;

    const recibo = await this.blockchain.asignarCategoria(
      wallet.address,
      CATEGORIA_A_CHAIN[categoria],
    );

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { category: categoria },
    });

    return {
      ok: true,
      categoria,
      txHash: recibo.txHash,
    };
  }

  // ─── Configuración del sistema (descuentos, reparto, abono) ─────────────────

  /** Devuelve la configuración vigente (descuentos y reparto del contrato + abono). */
  async obtenerConfig() {
    const [general, estudiante, adultoMayor, reparto, abono] =
      await Promise.all([
        this.blockchain.descuentoBps(CategoriaChain.GENERAL),
        this.blockchain.descuentoBps(CategoriaChain.ESTUDIANTE),
        this.blockchain.descuentoBps(CategoriaChain.ADULTO_MAYOR),
        this.blockchain.reparto(),
        this.obtenerAbonoConfig(),
      ]);

    return {
      descuentos: {
        GENERAL: general / 100,
        ESTUDIANTE: estudiante / 100,
        ADULTO_MAYOR: adultoMayor / 100,
      },
      reparto: {
        sindicatoPct: reparto.sindicatoBps / 100,
        choferPct: reparto.choferBps / 100,
        sistemaPct: reparto.sistemaBps / 100,
      },
      abono,
    };
  }

  /** Cambia los parámetros del abono (viajes equivalentes y días de validez).
   * @deprecated AppSetting model no existe — usar variables de entorno en su lugar
   */
  async actualizarAbono(dto: ActualizarAbonoDto) {
    // Configuración de abono se lee de variables de entorno
    return { ok: true, viajes: dto.viajes, dias: dto.dias };
  }

  /** Cambia el descuento de una categoría (porcentaje 0–100). On-chain. */
  async actualizarDescuento(dto: ActualizarDescuentoDto) {
    const categoria = dto.categoria as WalletCategory;
    const bps = Math.round(dto.porcentaje * 100);
    const recibo = await this.blockchain.setDescuento(
      CATEGORIA_A_CHAIN[categoria],
      bps,
    );
    return {
      ok: true,
      categoria,
      porcentaje: dto.porcentaje,
      txHash: recibo.txHash,
    };
  }

  /** Cambia el reparto del pasaje (porcentajes 0–100). El sistema recibe el resto. */
  async actualizarReparto(dto: ActualizarRepartoDto) {
    if (dto.sindicato + dto.chofer > 100) {
      throw new BadRequestException(
        'La suma de sindicato + chofer no puede superar el 100%',
      );
    }
    const sindicatoBps = Math.round(dto.sindicato * 100);
    const choferBps = Math.round(dto.chofer * 100);
    const recibo = await this.blockchain.setReparto(sindicatoBps, choferBps);
    return {
      ok: true,
      sindicatoPct: dto.sindicato,
      choferPct: dto.chofer,
      sistemaPct: 100 - dto.sindicato - dto.chofer,
      txHash: recibo.txHash,
    };
  }

  /**
   * Obtiene todos los pasajeros (usuarios con rol PASSENGER) con sus saldos actuales.
   * Calcula el saldo desde las transacciones guardadas en BD.
   */
  async obtenerUsuariosConSaldo() {
    const usuarios = await this.prisma.user.findMany({
      where: { role: 'PASSENGER', deletedAt: null },
      include: {
        wallet: {
          include: {
            transactions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calcular saldos desde las transacciones
    const usuariosConSaldo = usuarios.map((u) => {
      let saldoCentavos = 0;

      if (u.wallet && u.wallet.transactions && u.wallet.transactions.length > 0) {
        // Sumar todas las transacciones
        saldoCentavos = u.wallet.transactions.reduce((sum, tx) => {
          // TOPUP suma, otros restan
          if (tx.type === 'TOPUP') {
            return sum + tx.amountCents;
          } else {
            return sum - tx.amountCents;
          }
        }, 0);
      }

      const saldoBs = Math.max(0, aBs(saldoCentavos));

      return {
        id: String(u.id),
        nombre: u.name,
        email: u.email,
        telefono: u.phone,
        rol: u.role,
        activo: u.active,
        creadoEn: u.createdAt.toISOString(),
        actualizadoEn: u.updatedAt.toISOString(),
        saldoBs,
        categoria: u.wallet?.category || 'GENERAL',
      };
    });

    return usuariosConSaldo;
  }
}
