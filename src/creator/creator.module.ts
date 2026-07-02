import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchingModule } from '../matching/matching.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { StorageModule } from '../storage/storage.module';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';

@Module({
  imports: [PrismaModule, MatchingModule, NotificationsModule, PaymentsModule, StorageModule],
  controllers: [CreatorController],
  providers: [CreatorService],
})
export class CreatorModule {}
