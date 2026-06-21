import {
  Injectable,
  OnModuleInit,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/** Categorías on-chain (deben coincidir con el enum del contrato TransitPay). */
export enum CategoriaChain {
  GENERAL = 0,
  ESTUDIANTE = 1,
  ADULTO_MAYOR = 2,
}

export interface ReciboTx {
  txHash: string;
  blockNumber: number;
}

/**
 * Puente entre NestJS y el contrato TransitPay desplegado en la blockchain local.
 * Modelo custodial: el backend firma todas las transacciones con la cuenta "owner".
 * Las billeteras de los usuarios solo necesitan una dirección (no gastan gas).
 */
@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider!: ethers.JsonRpcProvider;
  private signer!: ethers.NonceManager;
  private contrato!: ethers.Contract;

  /** true cuando la blockchain está conectada y el contrato cargado. */
  public habilitado = false;

  onModuleInit() {
    try {
      const rpc = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
      const ownerKey = process.env.BLOCKCHAIN_OWNER_KEY;
      const red = process.env.BLOCKCHAIN_NETWORK || 'localhost';
      const deployPath = join(
        process.cwd(),
        'blockchain',
        'deployments',
        `${red}.json`,
      );

      if (!ownerKey) {
        this.logger.warn(
          'BLOCKCHAIN_OWNER_KEY no definido — módulo de billetera deshabilitado.',
        );
        return;
      }
      if (!existsSync(deployPath)) {
        this.logger.warn(
          `No se encontró el despliegue (${deployPath}). Ejecuta "npm run deploy" en /blockchain.`,
        );
        return;
      }

      const { address, abi } = JSON.parse(readFileSync(deployPath, 'utf8'));
      this.provider = new ethers.JsonRpcProvider(rpc);
      const owner = new ethers.Wallet(ownerKey, this.provider);
      // NonceManager asigna los nonces secuencialmente para evitar colisiones
      // cuando el backend firma varias transacciones casi simultáneas.
      this.signer = new ethers.NonceManager(owner);
      this.contrato = new ethers.Contract(address, abi, this.signer);
      this.habilitado = true;

      this.logger.log(
        `Blockchain conectada — contrato TransitPay en ${address}`,
      );
    } catch (error) {
      this.logger.error(
        `No se pudo inicializar la blockchain: ${(error as Error).message}`,
      );
    }
  }

  private asegurarHabilitado() {
    if (!this.habilitado) {
      throw new ServiceUnavailableException(
        'La blockchain no está disponible. Verifica que el nodo Hardhat esté corriendo y el contrato desplegado.',
      );
    }
  }

  /** Genera un nuevo par de llaves para una billetera custodial. */
  crearWallet(): { address: string; privateKey: string } {
    const w = ethers.Wallet.createRandom();
    return { address: w.address, privateKey: w.privateKey };
  }

  private async esperar(
    tx: ethers.ContractTransactionResponse,
  ): Promise<ReciboTx> {
    const r = await tx.wait();
    return { txHash: r!.hash, blockNumber: r!.blockNumber };
  }

  // ─── Lecturas ───────────────────────────────────────────────────────────────

  /** Saldo en centavos de Bs. */
  async saldoCentavos(address: string): Promise<number> {
    this.asegurarHabilitado();
    try {
      const saldo: bigint = await this.contrato.balanceOf(address);
      return Number(saldo);
    } catch (error) {
      this.logger.error(
        `Error al obtener saldo de ${address}: ${(error as Error).message}`,
      );
      return 0;
    }
  }

  async categoriaDe(address: string): Promise<CategoriaChain> {
    this.asegurarHabilitado();
    try {
      const c: bigint = await this.contrato.categoriaDe(address);
      return Number(c) as CategoriaChain;
    } catch (error) {
      this.logger.error(
        `Error al obtener categoría de ${address}: ${(error as Error).message}`,
      );
      return CategoriaChain.GENERAL;
    }
  }

  /** Descuento configurado para una categoría, en puntos base (5000 = 50%). */
  async descuentoBps(categoria: CategoriaChain): Promise<number> {
    this.asegurarHabilitado();
    try {
      const b: bigint = await this.contrato.descuentoBps(categoria);
      return Number(b);
    } catch (error) {
      this.logger.error(
        `Error al obtener descuento: ${(error as Error).message}`,
      );
      return 0;
    }
  }

  /** Reparto actual del pasaje en puntos base. El sistema recibe el resto. */
  async reparto(): Promise<{
    sindicatoBps: number;
    choferBps: number;
    sistemaBps: number;
  }> {
    this.asegurarHabilitado();
    try {
      const sindicato: bigint = await this.contrato.bpsSindicato();
      const chofer: bigint = await this.contrato.bpsChofer();
      const sindicatoBps = Number(sindicato);
      const choferBps = Number(chofer);
      return {
        sindicatoBps,
        choferBps,
        sistemaBps: 10000 - sindicatoBps - choferBps,
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener reparto: ${(error as Error).message}`,
      );
      return {
        sindicatoBps: 3000,
        choferBps: 5000,
        sistemaBps: 2000,
      };
    }
  }

  /** Tarifa final luego del descuento de la categoría del pasajero (centavos). */
  async tarifaConDescuento(
    address: string,
    tarifaBaseCentavos: number,
  ): Promise<number> {
    this.asegurarHabilitado();
    try {
      const t: bigint = await this.contrato.tarifaConDescuento(
        address,
        tarifaBaseCentavos,
      );
      return Number(t);
    } catch (error) {
      this.logger.error(
        `Error al obtener tarifa con descuento: ${(error as Error).message}`,
      );
      return tarifaBaseCentavos;
    }
  }

  // ─── Escrituras (firmadas por el owner) ──────────────────────────────────────

  async recargar(address: string, montoCentavos: number): Promise<ReciboTx> {
    this.asegurarHabilitado();
    const tx = await this.contrato.recargar(address, montoCentavos);
    return this.esperar(tx);
  }

  async asignarCategoria(
    address: string,
    categoria: CategoriaChain,
  ): Promise<ReciboTx> {
    this.asegurarHabilitado();
    const tx = await this.contrato.asignarCategoria(address, categoria);
    return this.esperar(tx);
  }

  /** Cambia el descuento de una categoría (bps: 0–10000). */
  async setDescuento(
    categoria: CategoriaChain,
    bps: number,
  ): Promise<ReciboTx> {
    this.asegurarHabilitado();
    const tx = await this.contrato.setDescuento(categoria, bps);
    return this.esperar(tx);
  }

  /** Cambia el reparto del pasaje (bps). sindicato + chofer ≤ 10000. */
  async setReparto(sindicatoBps: number, choferBps: number): Promise<ReciboTx> {
    this.asegurarHabilitado();
    const tx = await this.contrato.setReparto(sindicatoBps, choferBps);
    return this.esperar(tx);
  }

  async pagarPasaje(
    pasajero: string,
    sindicato: string,
    chofer: string,
    tarifaBaseCentavos: number,
  ): Promise<ReciboTx> {
    this.asegurarHabilitado();
    const tx = await this.contrato.pagarPasaje(
      pasajero,
      sindicato,
      chofer,
      tarifaBaseCentavos,
    );
    return this.esperar(tx);
  }

  async comprarAbono(
    pasajero: string,
    sindicato: string,
    precioCentavos: number,
    validoHastaUnix: number,
  ): Promise<ReciboTx> {
    this.asegurarHabilitado();
    const tx = await this.contrato.comprarAbono(
      pasajero,
      sindicato,
      precioCentavos,
      validoHastaUnix,
    );
    return this.esperar(tx);
  }
}
