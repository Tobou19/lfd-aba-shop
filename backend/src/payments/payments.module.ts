import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma.service';
import { MtnMomoProvider } from './providers/mtn-momo.provider';
import { OrangeMoneyProvider } from './providers/orange-money.provider';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService, MtnMomoProvider, OrangeMoneyProvider],
})
export class PaymentsModule {}
