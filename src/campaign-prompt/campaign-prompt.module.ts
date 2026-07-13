import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CampaignPromptController } from './campaign-prompt.controller';
import { CampaignPromptService } from './campaign-prompt.service';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignPromptController],
  providers: [CampaignPromptService],
  exports: [CampaignPromptService],
})
export class CampaignPromptModule {}
