import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchingModule } from '../matching/matching.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

@Module({
  imports: [PrismaModule, MatchingModule, NotificationsModule, PaymentsModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
