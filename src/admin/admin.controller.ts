import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
