import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { AnalyticsController } from './analytics.controller';
import { CreatorAnalyticsService } from './creator-analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsCacheService, CreatorAnalyticsService, AdminAnalyticsService],
  exports: [CreatorAnalyticsService, AdminAnalyticsService, AnalyticsCacheService],
})
export class AnalyticsModule {}
