import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminUserAnalyticsQueryDto } from '../analytics/admin-user-analytics.dto';
import { AdminUserAnalyticsService } from '../analytics/admin-user-analytics.service';

@ApiTags('Admin User Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('admin/analytics')
export class AdminUserAnalyticsController {
  constructor(private readonly adminUserAnalytics: AdminUserAnalyticsService) {}

  @Get('users')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List users with analytics summary' })
  listUsers(@Query() query: AdminUserAnalyticsQueryDto) {
    return this.adminUserAnalytics.listUsers(query);
  }

  @Get('users/:userId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'User analytics detail' })
  getUser(@Param('userId') userId: string) {
    return this.adminUserAnalytics.getUserDetail(userId);
  }

  @Get('users/:userId/wallet')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'User wallet analytics' })
  getWallet(@Param('userId') userId: string, @Query() query: AdminUserAnalyticsQueryDto) {
    return this.adminUserAnalytics.getUserWallet(userId, query);
  }

  @Get('users/:userId/activity')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'User activity analytics' })
  getActivity(@Param('userId') userId: string, @Query() query: AdminUserAnalyticsQueryDto) {
    return this.adminUserAnalytics.getUserActivity(userId, query);
  }

  @Get('users/:userId/campaigns')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'User campaign analytics' })
  getCampaigns(@Param('userId') userId: string, @Query() query: AdminUserAnalyticsQueryDto) {
    return this.adminUserAnalytics.getUserCampaigns(userId, query);
  }
}
