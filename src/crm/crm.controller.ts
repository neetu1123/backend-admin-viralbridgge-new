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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateCrmFollowUpDto,
  CreateCrmLeadDto,
  CreateCrmNoteDto,
  CrmLeadQueryDto,
  UpdateCrmLeadDto,
  UpdateCrmNoteDto,
} from './crm.dto';
import { CrmService } from './crm.service';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('admin/crm')
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  @Get('summary')
  @ApiOperation({ summary: 'CRM dashboard summary stats' })
  getSummary() {
    return this.crm.getSummary();
  }

  @Get('assignees')
  @ApiOperation({ summary: 'List admin users for lead assignment' })
  getAssignees() {
    return this.crm.getAssignees();
  }

  @Get('leads')
  @ApiOperation({ summary: 'List CRM leads with filters' })
  getLeads(@Query() query: CrmLeadQueryDto) {
    return this.crm.getLeads(query);
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get a single CRM lead' })
  getLead(@Param('id') id: string) {
    return this.crm.getLead(id);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create a new CRM lead' })
  createLead(@Body() body: CreateCrmLeadDto, @Request() req: { user?: { id: string; name: string } }) {
    return this.crm.createLead(body, req.user?.id, req.user?.name);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update a CRM lead' })
  updateLead(
    @Param('id') id: string,
    @Body() body: UpdateCrmLeadDto,
    @Request() req: { user?: { name: string } },
  ) {
    return this.crm.updateLead(id, body, req.user?.name);
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Soft-delete a CRM lead' })
  deleteLead(@Param('id') id: string) {
    return this.crm.deleteLead(id);
  }

  @Patch('leads/:id/archive')
  @ApiOperation({ summary: 'Archive a CRM lead' })
  archiveLead(@Param('id') id: string, @Request() req: { user?: { name: string } }) {
    return this.crm.archiveLead(id, req.user?.name);
  }

  @Post('leads/:id/notes')
  @ApiOperation({ summary: 'Add a note to a lead' })
  addNote(
    @Param('id') id: string,
    @Body() body: CreateCrmNoteDto,
    @Request() req: { user?: { name: string } },
  ) {
    return this.crm.addNote(id, body.content, req.user?.name || 'Admin');
  }

  @Patch('leads/:leadId/notes/:noteId')
  @ApiOperation({ summary: 'Update a lead note' })
  updateNote(
    @Param('leadId') leadId: string,
    @Param('noteId') noteId: string,
    @Body() body: UpdateCrmNoteDto,
  ) {
    return this.crm.updateNote(leadId, noteId, body.content);
  }

  @Delete('leads/:leadId/notes/:noteId')
  @ApiOperation({ summary: 'Delete a lead note' })
  deleteNote(@Param('leadId') leadId: string, @Param('noteId') noteId: string) {
    return this.crm.deleteNote(leadId, noteId);
  }

  @Post('leads/:id/follow-ups')
  @ApiOperation({ summary: 'Schedule a follow-up' })
  addFollowUp(@Param('id') id: string, @Body() body: CreateCrmFollowUpDto) {
    return this.crm.addFollowUp(id, body);
  }

  @Patch('leads/:leadId/follow-ups/:followUpId/complete')
  @ApiOperation({ summary: 'Mark follow-up as completed' })
  completeFollowUp(
    @Param('leadId') leadId: string,
    @Param('followUpId') followUpId: string,
  ) {
    return this.crm.completeFollowUp(leadId, followUpId);
  }
}
