import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AnalyticsQueryDto } from './analytics.dto';
import { CreatorAnalyticsService } from './creator-analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly creatorAnalytics: CreatorAnalyticsService,
    private readonly adminAnalytics: AdminAnalyticsService,
  ) {}

  @Get('creator/dashboard')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Creator analytics dashboard KPIs' })
  creatorDashboard(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.creatorAnalytics.getDashboard(req.user.id, query);
  }

  @Get('creator/earnings')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Creator earnings trends and funnel' })
  creatorEarnings(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.creatorAnalytics.getEarnings(req.user.id, query);
  }

  @Get('creator/profile-performance')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Creator profile performance metrics' })
  creatorProfilePerformance(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.creatorAnalytics.getProfilePerformance(req.user.id, query);
  }

  @Get('creator/top-brands')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Top brands worked with' })
  creatorTopBrands(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.creatorAnalytics.getTopBrands(req.user.id, query);
  }

  @Get('admin/dashboard')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin analytics dashboard KPIs' })
  adminDashboard(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.adminAnalytics.getDashboard(req.user.id, query);
  }

  @Get('admin/users')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'User growth analytics' })
  adminUsers(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.adminAnalytics.getUsers(req.user.id, query);
  }

  @Get('admin/revenue')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Platform revenue growth' })
  adminRevenue(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.adminAnalytics.getRevenue(req.user.id, query);
  }

  @Get('admin/campaigns')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Campaign analytics and growth' })
  adminCampaigns(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.adminAnalytics.getCampaigns(req.user.id, query);
  }

  @Get('admin/kyc')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'KYC pipeline analytics' })
  adminKyc(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.adminAnalytics.getKyc(req.user.id, query);
  }

  @Get('admin/platforms')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Platform distribution and top categories' })
  adminPlatforms(@Request() req: { user: { id: string } }, @Query() query: AnalyticsQueryDto) {
    return this.adminAnalytics.getPlatforms(req.user.id, query);
  }
}
