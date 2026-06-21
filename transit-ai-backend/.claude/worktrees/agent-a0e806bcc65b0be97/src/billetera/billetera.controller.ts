import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BilleteraService } from './billetera.service';
import { RecargarDto, PagarDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('billetera')
@UseGuards(JwtAuthGuard)
export class BilleteraController {
  constructor(private billeteraService: BilleteraService) {}

  @Get('saldo')
  async obtenerSaldo(@CurrentUser('id') usuarioId: string) {
    return this.billeteraService.obtenerSaldo(usuarioId);
  }

  @Post('recargar')
  @HttpCode(HttpStatus.OK)
  async recargar(
    @CurrentUser('id') usuarioId: string,
    @Body() dto: RecargarDto,
  ) {
    return this.billeteraService.recargar(usuarioId, dto);
  }

  @Post('pagar')
  @HttpCode(HttpStatus.OK)
  async pagar(@CurrentUser('id') usuarioId: string, @Body() dto: PagarDto) {
    return this.billeteraService.pagar(usuarioId, dto);
  }

  @Get('historial')
  async obtenerHistorial(@CurrentUser('id') usuarioId: string) {
    return this.billeteraService.obtenerHistorial(usuarioId);
  }
}
