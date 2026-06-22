import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvitationPreviewDto } from './organization.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organization Team')
@Controller('organization')
export class OrganizationPublicController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('team/invitation/:token')
  @ApiOperation({ summary: 'Get invitation details by token (public, no auth required)' })
  @ApiParam({ name: 'token', description: 'Invitation token from email link' })
  @ApiResponse({ status: 200, type: InvitationPreviewDto })
  getInvitationByToken(@Param('token') token: string) {
    return this.organizationService.getInvitationByToken(token);
  }
}
