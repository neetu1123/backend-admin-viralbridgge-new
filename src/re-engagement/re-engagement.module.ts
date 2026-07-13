import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { MatchingModule } from '../matching/matching.module';
import { UserActivityModule } from '../user-activity/user-activity.module';
import { ReEngagementController } from './re-engagement.controller';
import { ReEngagementService } from './re-engagement.service';

@Module({
  imports: [PrismaModule, EmailModule, MatchingModule, UserActivityModule],
  controllers: [ReEngagementController],
  providers: [ReEngagementService],
  exports: [ReEngagementService],
})
export class ReEngagementModule {}
