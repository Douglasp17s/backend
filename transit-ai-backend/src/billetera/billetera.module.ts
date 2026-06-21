import { Module } from '@nestjs/common';
import { BilleteraService } from './billetera.service';
import { BilleteraController } from './billetera.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, AuthModule, BlockchainModule],
  controllers: [BilleteraController],
  providers: [BilleteraService],
  exports: [BilleteraService],
})
export class BilleteraModule {}
