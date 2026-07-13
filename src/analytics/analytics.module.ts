import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminUserAnalyticsController } from './admin-user-analytics.controller';
import { AdminUserAnalyticsService } from './admin-user-analytics.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { AnalyticsController } from './analytics.controller';
import { CreatorAnalyticsService } from './creator-analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController, AdminUserAnalyticsController],
  providers: [AnalyticsCacheService, CreatorAnalyticsService, AdminAnalyticsService, AdminUserAnalyticsService],
  exports: [CreatorAnalyticsService, AdminAnalyticsService, AdminUserAnalyticsService, AnalyticsCacheService],
})
export class AnalyticsModule {}
