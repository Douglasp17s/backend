import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BilleteraService } from './billetera.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RecargarDto } from './dto/recargar.dto';
import { PagarPasajeDto } from './dto/pagar-pasaje.dto';
import { PagarQrDto } from './dto/pagar-qr.dto';
import { ComprarAbonoDto } from './dto/comprar-abono.dto';
import { AsignarCategoriaDto } from './dto/asignar-categoria.dto';
import { ActualizarDescuentoDto } from './dto/actualizar-descuento.dto';
import { ActualizarRepartoDto } from './dto/actualizar-reparto.dto';
import { ActualizarAbonoDto } from './dto/actualizar-abono.dto';
import { StripeCheckoutDto } from './dto/stripe-checkout.dto';
import { StripeConfirmarDto } from './dto/stripe-confirmar.dto';

// Roles autorizados a cambiar la configuración del sistema.
const ROLES_ADMIN = ['SUPERADMIN', 'SINDICATO_ADMIN'];

@UseGuards(JwtAuthGuard)
@Controller('billetera')
export class BilleteraController {
  constructor(private readonly billeteraService: BilleteraService) {}

  /** Crea (si no existe) y devuelve la billetera del usuario. */
  @Post()
  async crear(@CurrentUser() usuario: any) {
    if (!usuario?.id) throw new ForbiddenException('Usuario no autenticado');
    return this.billeteraService.obtenerOCrearBilletera(usuario.id);
  }

  /** Saldo y datos de la billetera. */
  @Get()
  async resumen(@CurrentUser() usuario: any) {
    if (!usuario?.id) throw new ForbiddenException('Usuario no autenticado');
    return this.billeteraService.resumen(usuario.id);
  }

  /** Recarga de saldo por medio tradicional (tarjeta/transferencia). */
  @Post('recargar')
  async recargar(@CurrentUser() usuario: any, @Body() dto: RecargarDto) {
    if (!usuario?.id) throw new ForbiddenException('Usuario no autenticado');
    return this.billeteraService.recargar(usuario.id, dto);
  }

  /** Crea una sesión de pago de Stripe para recargar y devuelve la URL. */
  @Post('stripe/checkout')
  async stripeCheckout(@CurrentUser() usuario: any, @Body() dto: StripeCheckoutDto) {
    if (!usuario?.id) throw new ForbiddenException('Usuario no autenticado');
    return this.billeteraService.crearCheckoutStripe(usuario.id, dto.monto);
  }

  /** Confirma el pago de Stripe y acredita el saldo. */
  @Post('stripe/confirmar')
  async stripeConfirmar(@CurrentUser() usuario: any, @Body() dto: StripeConfirmarDto) {
    if (!usuario?.id) throw new ForbiddenException('Usuario no autenticado');
    return this.billeteraService.confirmarCheckoutStripe(usuario.id, dto.sessionId);
  }

  /** Paga el pasaje de una línea desde la propia billetera. */
  @Post('pagar')
  async pagar(@CurrentUser() usuario: any, @Body() dto: PagarPasajeDto) {
    return this.billeteraService.pagarPasaje(usuario?.id, dto.lineaId);
  }

  /** Genera el QR de pago del pasajero (de corta duración). */
  @Get('qr')
  async generarQr(@CurrentUser() usuario: any) {
    return this.billeteraService.generarQr(usuario?.id);
  }

  /** El chofer escanea el QR del pasajero y cobra el pasaje. */
  @Post('pagar-qr')
  async pagarQr(@CurrentUser() usuario: any, @Body() dto: PagarQrDto) {
    return this.billeteraService.pagarPorQr(dto.qr, dto.lineaId, usuario?.id);
  }

  /** Compra un abono / pase mensual. */
  @Post('abono')
  async comprarAbono(
    @CurrentUser() usuario: any,
    @Body() dto: ComprarAbonoDto,
  ) {
    return this.billeteraService.comprarAbono(usuario?.id, dto);
  }

  /** Estado del abono vigente. */
  @Get('abono')
  async abonoActivo(@CurrentUser() usuario: any) {
    return this.billeteraService.abonoActivo(usuario?.id);
  }

  /** Historial de transacciones de la billetera del usuario autenticado. */
  @Get('historial')
  async historial(@CurrentUser() usuario: any) {
    return this.billeteraService.historial(usuario?.id);
  }

  /** (Admin) Movimientos de todas las billeteras, filtrable por tipo o usuario. */
  @Get('transacciones')
  async transacciones(
    @CurrentUser() usuario: any,
    @Query('tipo') tipo?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    this.soloAdmin(usuario);
    return this.billeteraService.transacciones({ tipo, usuarioId });
  }

  // ─── Configuración del sistema (solo administradores) ───────────────────────

  /** Obtiene todos los pasajeros con sus saldos actuales. */
  @Get('usuarios-con-saldo')
  async obtenerUsuariosConSaldo(@CurrentUser() usuario: any) {
    this.soloAdmin(usuario);
    return this.billeteraService.obtenerUsuariosConSaldo();
  }

  /** Configuración vigente: descuentos, reparto y parámetros del abono. */
  @Get('config')
  async obtenerConfig() {
    return this.billeteraService.obtenerConfig();
  }

  /** Cambia el descuento de una categoría `{ categoria, porcentaje }`. */
  @Patch('config/descuento')
  async actualizarDescuento(
    @CurrentUser() usuario: any,
    @Body() dto: ActualizarDescuentoDto,
  ) {
    this.soloAdmin(usuario);
    return this.billeteraService.actualizarDescuento(dto);
  }

  /** Cambia el reparto del pasaje `{ sindicato, chofer }` (en %). */
  @Patch('config/reparto')
  async actualizarReparto(
    @CurrentUser() usuario: any,
    @Body() dto: ActualizarRepartoDto,
  ) {
    this.soloAdmin(usuario);
    return this.billeteraService.actualizarReparto(dto);
  }

  /** Cambia los parámetros del abono `{ viajes, dias }`. */
  @Patch('config/abono')
  async actualizarAbono(
    @CurrentUser() usuario: any,
    @Body() dto: ActualizarAbonoDto,
  ) {
    this.soloAdmin(usuario);
    return this.billeteraService.actualizarAbono(dto);
  }

  /** Asigna la categoría de descuento a un usuario (estudiante, adulto mayor). */
  @Post(':usuarioId/categoria')
  async asignarCategoria(
    @CurrentUser() usuario: any,
    @Param('usuarioId') usuarioId: string,
    @Body() dto: AsignarCategoriaDto,
  ) {
    this.soloAdmin(usuario);
    return this.billeteraService.asignarCategoria(usuarioId, dto);
  }

  private soloAdmin(usuario: { role?: string }) {
    if (!usuario?.role || !ROLES_ADMIN.includes(usuario?.role)) {
      throw new ForbiddenException(
        'Solo un administrador puede modificar esta configuración',
      );
    }
  }
}
