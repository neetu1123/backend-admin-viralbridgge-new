import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import {
  AdminAssignDto,
  AdminCaseQueryDto,
  AdminNoteDto,
  AdminUpdateCaseDto,
  SendMessageDto,
} from './support.dto';
import { SupportService } from './support.service';

@ApiTags('Admin Support')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('admin/support')
export class AdminSupportController {
  constructor(private readonly support: SupportService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Support dashboard summary' })
  getSummary() {
    return this.support.getAdminSummary();
  }

  @Get('cases')
  getCases(
    @Query() query: AdminCaseQueryDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.support.getAdminCases(query, req.user?.id);
  }

  @Get('cases/:caseId')
  getCase(@Param('caseId') caseId: string) {
    return this.support.getAdminCase(caseId);
  }

  @Patch('cases/:caseId')
  updateCase(
    @Param('caseId') caseId: string,
    @Body() body: AdminUpdateCaseDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.support.adminUpdateCase(caseId, body, req.user!.id);
  }

  @Post('cases/:caseId/assign')
  assign(
    @Param('caseId') caseId: string,
    @Body() body: AdminAssignDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.support.adminAssign(caseId, req.user!.id, body.adminId);
  }

  @Post('cases/:caseId/messages')
  reply(
    @Param('caseId') caseId: string,
    @Body() body: SendMessageDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.support.adminReply(caseId, req.user!.id, body.message);
  }

  @Post('cases/:caseId/notes')
  addNote(
    @Param('caseId') caseId: string,
    @Body() body: AdminNoteDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.support.adminAddNote(caseId, req.user!.id, body);
  }

  @Post('cases/:caseId/resolve')
  resolve(@Param('caseId') caseId: string, @Request() req: { user?: { id: string } }) {
    return this.support.adminResolve(caseId, req.user!.id);
  }

  @Post('cases/:caseId/close')
  close(@Param('caseId') caseId: string, @Request() req: { user?: { id: string } }) {
    return this.support.adminClose(caseId, req.user!.id);
  }

  @Post('cases/:caseId/reopen')
  reopen(@Param('caseId') caseId: string, @Request() req: { user?: { id: string } }) {
    return this.support.adminReopen(caseId, req.user!.id);
  }
}
