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
  BulkAssignDto,
  BulkLeadIdsDto,
  BulkUpdateDto,
  CreateCrmFollowUpDto,
  CreateCrmLeadDto,
  CreateCrmNoteDto,
  CrmLeadQueryDto,
  ExportLeadsDto,
  ImportConfirmDto,
  ImportPreviewDto,
  ReassignLeadDto,
  UpdateCrmLeadDto,
  UpdateCrmNoteDto,
} from './crm.dto';
import { CrmService } from './crm.service';
import { CrmEnhancementService } from './crm-enhancement.service';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('admin/crm')
export class CrmController {
  constructor(
    private readonly crm: CrmService,
    private readonly crmEnhancement: CrmEnhancementService,
  ) {}

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

  @Get('agents')
  getAgents(@Query('activeOnly') activeOnly?: string) {
    return this.crmEnhancement.getAgents(activeOnly === 'true');
  }

  @Get('agents/:userId/workload')
  getAgentWorkload(@Param('userId') userId: string) {
    return this.crmEnhancement.getAgentWorkload(userId);
  }

  @Post('leads/bulk-assign')
  bulkAssign(@Body() body: BulkAssignDto, @Request() req: { user?: { id: string } }) {
    return this.crmEnhancement.bulkAssign(body.leadIds, body.agentId, req.user!.id);
  }

  @Post('leads/bulk-auto-assign')
  bulkAutoAssign(@Body() body: BulkLeadIdsDto, @Request() req: { user?: { id: string } }) {
    return this.crmEnhancement.bulkAutoAssign(body.leadIds, req.user!.id);
  }

  @Post('leads/bulk-update')
  bulkUpdate(@Body() body: BulkUpdateDto) {
    return this.crmEnhancement.bulkUpdate(body.leadIds, {
      leadStatus: body.leadStatus,
      priority: body.priority,
      tags: body.tags,
    });
  }

  @Post('leads/bulk-delete')
  bulkDelete(@Body() body: BulkLeadIdsDto) {
    return this.crmEnhancement.bulkDelete(body.leadIds);
  }

  @Post('leads/:leadId/assign')
  assignLead(
    @Param('leadId') leadId: string,
    @Body() body: { agentId: string },
    @Request() req: { user?: { id: string } },
  ) {
    return this.crmEnhancement.assignLead(leadId, body.agentId, req.user!.id);
  }

  @Post('leads/:leadId/reassign')
  reassignLead(
    @Param('leadId') leadId: string,
    @Body() body: ReassignLeadDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.crmEnhancement.reassignLead(leadId, body.agentId, req.user!.id, body.reason);
  }

  @Get('leads/:leadId/assignment-history')
  getAssignmentHistory(@Param('leadId') leadId: string) {
    return this.crmEnhancement.getAssignmentHistory(leadId);
  }

  @Post('leads/import/preview')
  importPreview(@Body() body: ImportPreviewDto, @Request() req: { user?: { id: string } }) {
    return this.crmEnhancement.importPreview(body.fileName, body.rows, req.user!.id);
  }

  @Post('leads/import/confirm')
  importConfirm(@Body() body: ImportConfirmDto, @Request() req: { user?: { id: string } }) {
    return this.crmEnhancement.importConfirm(
      body.importJobId,
      req.user!.id,
      body.duplicateStrategy ?? 'SKIP',
    );
  }

  @Get('import-history')
  getImportHistory() {
    return this.crmEnhancement.getImportHistory();
  }

  @Get('import/:importId')
  getImportJob(@Param('importId') importId: string) {
    return this.crmEnhancement.getImportJob(importId);
  }

  @Get('import/:importId/errors')
  getImportErrors(@Param('importId') importId: string) {
    return this.crmEnhancement.getImportErrorsCsv(importId);
  }

  @Post('leads/export')
  exportLeads(@Body() body: ExportLeadsDto, @Request() req: { user?: { id: string } }) {
    return this.crmEnhancement.exportLeads(req.user!.id, body);
  }

  @Get('export-history')
  getExportHistory() {
    return this.crmEnhancement.getExportHistory();
  }

  @Get('export/:exportId/download')
  getExportDownload(@Param('exportId') exportId: string) {
    return this.crmEnhancement.getExportDownload(exportId);
  }

  @Post('leads/filter-ids')
  getLeadIdsByFilters(@Body() body: CrmLeadQueryDto) {
    return this.crmEnhancement.getLeadIdsByFilters(body);
  }
}
