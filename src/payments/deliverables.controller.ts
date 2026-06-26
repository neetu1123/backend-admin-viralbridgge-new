import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { DeliverablesService } from './deliverables.service';
import {
  DeliverableRejectDto,
  DeliverableRevisionDto,
  SubmitDeliverableDto,
} from './dto/deliverables.dto';

@ApiTags('Deliverables')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Post('submit')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Submit deliverable (requires escrow HELD)' })
  submit(@Request() req: { user: { id: string } }, @Body() body: SubmitDeliverableDto) {
    return this.deliverablesService.submit(req.user.id, body);
  }

  @Get(':campaignId')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List deliverables for a campaign' })
  list(
    @Request() req: { user: { id: string; role?: { name: string } } },
    @Param('campaignId') campaignId: string,
  ) {
    return this.deliverablesService.listByCampaign(req.user.id, campaignId, req.user.role?.name);
  }

  @Post(':id/request-revision')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Request revision on a deliverable' })
  requestRevision(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: DeliverableRevisionDto,
  ) {
    return this.deliverablesService.requestRevision(req.user.id, id, body);
  }

  @Post(':id/approve')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve deliverable and release escrow when all approved' })
  approve(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.deliverablesService.approve(req.user.id, id);
  }

  @Post(':id/reject')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Reject a deliverable' })
  reject(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: DeliverableRejectDto,
  ) {
    return this.deliverablesService.reject(req.user.id, id, body);
  }
}
