import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchingModule } from '../matching/matching.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { StorageModule } from '../storage/storage.module';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

import { CampaignPromptModule } from '../campaign-prompt/campaign-prompt.module';

@Module({
  imports: [PrismaModule, MatchingModule, NotificationsModule, PaymentsModule, StorageModule, CampaignPromptModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
