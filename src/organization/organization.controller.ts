import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import {
  AcceptInvitationDto,
  ChangeMemberRoleDto,
  InviteMemberDto,
  InviteMemberResponseDto,
  RolePermissionsDto,
  TeamResponseDto,
} from './organization.dto';
import { OrganizationService } from './organization.service';
import type { OrganizationType } from './organization.constants';

@ApiTags('Organization Team')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('team')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get team members and pending invitations' })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  getTeam(@Request() req: { user: { id: string } }) {
    return this.organizationService.getTeam(req.user.id);
  }

  @Post('team/invite')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Invite a new team member (owner only)' })
  @ApiResponse({ status: 201, type: InviteMemberResponseDto })
  inviteMember(@Request() req: { user: { id: string } }, @Body() body: InviteMemberDto) {
    return this.organizationService.inviteMember(req.user.id, body);
  }

  @Get('team/invitations/mine')
  @ApiOperation({ summary: 'List pending invitations for the current user' })
  getMyInvitations(@Request() req: { user: { id: string } }) {
    return this.organizationService.getMyInvitations(req.user.id);
  }

  @Post('team/accept')
  @ApiOperation({ summary: 'Accept a team invitation' })
  acceptInvitation(@Request() req: { user: { id: string } }, @Body() body: AcceptInvitationDto) {
    return this.organizationService.acceptInvitation(req.user.id, body);
  }

  @Patch('team/member/:id/role')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Change a team member role (owner only)' })
  @ApiParam({ name: 'id', description: 'Organization member ID' })
  changeMemberRole(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: ChangeMemberRoleDto,
  ) {
    return this.organizationService.changeMemberRole(req.user.id, id, body);
  }

  @Delete('team/member/:id')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Remove a team member (owner only)' })
  @ApiParam({ name: 'id', description: 'Organization member ID' })
  removeMember(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.organizationService.removeMember(req.user.id, id);
  }

  @Post('team/member/:id/reinvite')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Resend a pending invitation (owner only)' })
  @ApiParam({ name: 'id', description: 'Pending invitation ID' })
  reinviteMember(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.organizationService.reinviteMember(req.user.id, id);
  }

  @Post('team/invitation/:id/cancel')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Cancel a pending invitation (owner only)' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  cancelInvitation(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.organizationService.cancelInvitation(req.user.id, id);
  }

  @Get('team/roles/permissions')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get permission preview for a role' })
  @ApiQuery({ name: 'type', enum: ['BRAND', 'CREATOR'] })
  @ApiQuery({ name: 'role', description: 'Organization role key' })
  @ApiResponse({ status: 200, type: RolePermissionsDto })
  getRolePermissions(@Query('type') type: 'BRAND' | 'CREATOR', @Query('role') role: string) {
    return this.organizationService.getRolePermissions(type as OrganizationType, role);
  }
}
