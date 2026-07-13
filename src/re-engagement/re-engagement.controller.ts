import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { ReEngagementService } from './re-engagement.service';

@ApiTags('Re-engagement')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('admin/re-engagement')
export class ReEngagementController {
  constructor(private readonly reEngagement: ReEngagementService) {}

  @Get('analytics')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Re-engagement email analytics' })
  getAnalytics() {
    return this.reEngagement.getAnalytics();
  }

  @Post('run')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Manually trigger re-engagement job' })
  runJob() {
    return this.reEngagement.processInactiveUsers();
  }
}
