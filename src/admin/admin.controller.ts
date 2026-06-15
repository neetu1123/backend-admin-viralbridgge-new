import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';
import { KycService } from '../kyc/kyc.service';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly kycService: KycService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Roles & Admins ──────────────────────────────────────────────────────────

  @Get('roles')
  getRoles() { return this.adminService.getRoles(); }

  @Post('roles')
  createRole(@Body() body: { name: string; description: string }, @Request() req: any) {
    return this.adminService.createRole(body.name, body.description, req.user?.id);
  }

  @Put('roles/:id')
  updateRole(@Param('id') id: string, @Body() body: { name: string; description: string }, @Request() req: any) {
    return this.adminService.updateRole(id, body.name, body.description, req.user?.id);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string, @Request() req: any) {
    return this.adminService.deleteRole(id, req.user?.id);
  }

  @Get('admins')
  getAdmins() { return this.adminService.getAdmins(); }

  @Post('admins/assign')
  assignRoleByEmail(@Body() body: { email: string; role_id: string; password?: string; name?: string }, @Request() req: any) {
    return this.adminService.assignRoleByEmail(body, req.user?.id);
  }

  // ─── Users ────────────────────────────────────────────────────────────────────

  @Get('users')
  getUsers() { return this.adminService.getUsers(); }

  @Get('users/:id')
  getUser(@Param('id') id: string) { return this.adminService.getUser(id); }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: { role_id: string }, @Request() req: any) {
    return this.adminService.updateUserRole(id, body.role_id, req.user?.id);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string, @Request() req: any) {
    return this.adminService.banUser(id, req.user?.id);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string, @Request() req: any) {
    return this.adminService.unbanUser(id, req.user?.id);
  }

  // ─── Campaigns ────────────────────────────────────────────────────────────────

  @Get('campaigns')
  getCampaigns() { return this.adminService.getCampaigns(); }

  @Get('campaigns/flagged')
  getFlaggedCampaigns() { return this.adminService.getFlaggedCampaigns(); }

  @Post('campaigns/:id/approve')
  approveCampaign(@Param('id') id: string, @Request() req: any) {
    return this.adminService.approveCampaign(id, req.user?.id);
  }

  @Post('campaigns/:id/reject')
  rejectCampaign(@Param('id') id: string, @Request() req: any) {
    return this.adminService.rejectCampaign(id, req.user?.id);
  }

  @Post('campaigns/:id/flag')
  flagCampaign(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    return this.adminService.flagCampaign(id, body.reason ?? '', req.user?.id);
  }

  // ─── Transactions & Analytics ─────────────────────────────────────────────────

  @Get('transactions')
  getTransactions() { return this.adminService.getTransactions(); }

  @Get('dashboard/stats')
  getDashboardStats() { return this.adminService.getDashboardStats(); }

  // ─── Platform Settings ────────────────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update platform settings' })
  updateSettings(
    @Body() body: { aiMatchingEnabled?: boolean },
    @Request() req: any,
  ) {
    return this.adminService.updateSettings(body, req.user?.id);
  }

  // ─── AI Matching ──────────────────────────────────────────────────────────────

  @Get('matching')
  @ApiOperation({ summary: 'List AI creator-campaign matches' })
  getMatches() {
    return this.adminService.getMatches();
  }

  @Patch('matching/:id')
  @ApiOperation({ summary: 'Update match status (active, removed, forced)' })
  updateMatch(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'removed' | 'forced' },
    @Request() req: any,
  ) {
    return this.adminService.updateMatch(id, body.status, req.user?.id);
  }

  @Post('matching/run')
  @ApiOperation({ summary: 'Recompute AI matches for all active campaigns' })
  runMatching() {
    return this.adminService.runMatching();
  }

  // ─── Audit Logs ───────────────────────────────────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get paginated audit logs with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'entity', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'admin_id', required: false, type: String })
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('admin_id') admin_id?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      entity,
      action,
      admin_id,
    });
  }

  @Get('audit-logs/stats')
  @ApiOperation({ summary: 'Get audit log statistics (total, today, by entity)' })
  getAuditLogStats() {
    return this.adminService.getAuditLogStats();
  }

  @Post('audit-logs')
  @ApiOperation({ summary: 'Manually create an audit log entry' })
  createAuditLog(
    @Body() body: { action: string; entity: string; entity_id: string; metadata?: any },
    @Request() req: any,
  ) {
    return this.adminService.createAuditLog({
      admin_id: req.user?.id,
      action: body.action,
      entity: body.entity,
      entity_id: body.entity_id,
      metadata: body.metadata,
    });
  }

  // ─── KYC ──────────────────────────────────────────────────────────────────────

  @Get('kyc')
  getKyc(@Query('status') status?: string, @Query('user_type') user_type?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.kycService.listAdmin({
      status,
      user_type,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post('kyc/:id/approve')
  approveKyc(@Param('id') id: string, @Body() body: { remarks?: string }, @Request() req: any) {
    return this.kycService.approve(id, req.user.id, body?.remarks);
  }

  @Post('kyc/:id/reject')
  rejectKyc(@Param('id') id: string, @Body() body: { remarks?: string }, @Request() req: any) {
    return this.kycService.reject(id, req.user.id, body?.remarks);
  }

  // ─── Notifications ────────────────────────────────────────────────────────────

  @Get('notifications/unread-count')
  getUnreadCount(@Request() req: any) {
    return this.notifications.unreadCount(req.user.id);
  }

  @Get('notifications')
  getNotifications(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('unread') unread?: string,
  ) {
    return this.notifications.list(req.user.id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      type,
      unread: unread === 'true',
    });
  }

  @Patch('notifications/read-all')
  markAllNotificationsRead(@Request() req: any) {
    return this.notifications.markAllRead(req.user.id);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(@Param('id') id: string, @Request() req: any) {
    return this.notifications.markRead(req.user.id, id);
  }

  // ─── Quick Actions ────────────────────────────────────────────────────────────

  @Post('invite-admin')
  inviteAdmin(@Body() body: { email: string; role_id: string; password?: string; name?: string }, @Request() req: any) {
    return this.adminService.assignRoleByEmail(body, req.user?.id);
  }

  @Post('test-campaign')
  createTestCampaign(@Request() req: any) {
    return this.adminService.createTestCampaign(req.user?.id);
  }

  @Get('withdrawals')
  getWithdrawals(@Query('status') status?: string) {
    return this.adminService.getWithdrawals(status ?? 'PENDING');
  }

  @Patch('withdrawals/:id/approve')
  approveWithdrawal(@Param('id') id: string, @Request() req: any) {
    return this.adminService.approveWithdrawal(id, req.user?.id);
  }

  @Patch('withdrawals/:id/reject')
  rejectWithdrawal(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    return this.adminService.rejectWithdrawal(id, req.user?.id, body?.reason);
  }
}
