import { Module } from '@nestjs/common';
import { BilleteraService } from './billetera.service';
import { BilleteraController } from './billetera.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * BilleteraModule agrupa la gestión de billeteras y transacciones de los usuarios.
 * Proporciona endpoints para consultar saldo, recargar, pagar y ver historial.
 */
@Module({
  imports: [PrismaModule],
  controllers: [BilleteraController],
  providers: [BilleteraService],
  exports: [BilleteraService],
})
export class BilleteraModule {}
