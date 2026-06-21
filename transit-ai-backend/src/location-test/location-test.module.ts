import { Module } from '@nestjs/common';
import { LocationTestService } from './location-test.service';
import { LocationTestController } from './location-test.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LocationTestController],
  providers: [LocationTestService],
  exports: [LocationTestService],
})
export class LocationTestModule {}
