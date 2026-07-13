import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CampaignPromptEventDto } from './campaign-prompt.dto';
import { CampaignPromptService } from './campaign-prompt.service';

@ApiTags('Campaign Prompt')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('campaign-prompt')
export class CampaignPromptController {
  constructor(private readonly campaignPrompt: CampaignPromptService) {}

  @Post('event')
  @Roles('BRAND')
  @ApiOperation({ summary: 'Track campaign creation prompt event' })
  recordEvent(@Request() req: { user: { id: string } }, @Body() body: CampaignPromptEventDto) {
    return this.campaignPrompt.recordEvent(req.user.id, body.eventType, body.metadata);
  }

  @Get('status')
  @Roles('BRAND')
  @ApiOperation({ summary: 'Get whether campaign prompt should be shown' })
  getStatus(@Request() req: { user: { id: string } }) {
    return this.campaignPrompt.getStatus(req.user.id);
  }

  @Get('analytics')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Campaign prompt conversion analytics' })
  getAnalytics() {
    return this.campaignPrompt.getAnalytics();
  }
}
