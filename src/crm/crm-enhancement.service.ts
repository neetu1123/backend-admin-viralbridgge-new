import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrmLeadQueryDto } from './crm.dto';
import {
  EXPORT_FIELD_MAP,
  leadsToCsv,
  normalizeImportRow,
  validateImportRow,
} from './crm-import.util';

type AssignmentType =
  | 'INITIAL_ASSIGNMENT'
  | 'MANUAL_ASSIGNMENT'
  | 'BULK_ASSIGNMENT'
  | 'REASSIGNMENT'
  | 'IMPORT_ASSIGNMENT'
  | 'AUTO_ASSIGNMENT';

@Injectable()
export class CrmEnhancementService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAgentProfiles() {
    const admins = await this.prisma.user.findMany({
      where: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
      select: { id: true },
    });
    for (const admin of admins) {
      await this.prisma.crmAgent.upsert({
        where: { user_id: admin.id },
        update: {},
        create: { user_id: admin.id, status: 'ACTIVE' },
      });
    }
  }

  async getAgents(activeOnly = false) {
    await this.ensureAgentProfiles();
    const todayStr = new Date().toISOString().slice(0, 10);
    const agents = await this.prisma.crmAgent.findMany({
      where: activeOnly ? { status: 'ACTIVE' } : undefined,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });

    return Promise.all(
      agents.map(async (a) => {
        const [assignedLeads, todaysFollowUps] = await Promise.all([
          this.prisma.crmLead.count({
            where: { assigned_to_id: a.user_id, is_deleted: false },
          }),
          this.prisma.crmLead.count({
            where: {
              assigned_to_id: a.user_id,
              is_deleted: false,
              next_follow_up_date: todayStr,
            },
          }),
        ]);
        return {
          id: a.id,
          userId: a.user_id,
          name: a.user.name,
          email: a.user.email,
          avatar: a.user.avatar ?? undefined,
          phone: a.phone ?? undefined,
          status: a.status,
          assignedLeads,
          todaysFollowUps,
          lastActivity: a.last_activity?.toISOString(),
        };
      }),
    );
  }

  async getAgentWorkload(userId: string) {
    const agent = await this.prisma.crmAgent.findUnique({
      where: { user_id: userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    const todayStr = new Date().toISOString().slice(0, 10);
    const [assignedLeads, todaysFollowUps] = await Promise.all([
      this.prisma.crmLead.count({ where: { assigned_to_id: userId, is_deleted: false } }),
      this.prisma.crmLead.count({
        where: { assigned_to_id: userId, is_deleted: false, next_follow_up_date: todayStr },
      }),
    ]);
    return {
      userId,
      name: agent.user.name,
      email: agent.user.email,
      status: agent.status,
      assignedLeads,
      todaysFollowUps,
    };
  }

  private async recordAssignment(
    leadId: string,
    previousAgentId: string | null,
    newAgentId: string | null,
    assignedById: string,
    assignmentType: AssignmentType,
    reason?: string,
    agentName?: string,
  ) {
    await this.prisma.crmLeadAssignment.create({
      data: {
        lead_id: leadId,
        previous_agent_id: previousAgentId,
        new_agent_id: newAgentId,
        assigned_by_id: assignedById,
        reason,
        assignment_type: assignmentType,
      },
    });
    await this.prisma.crmTimelineEvent.create({
      data: {
        lead_id: leadId,
        type: 'assigned',
        title: previousAgentId ? 'Lead Reassigned' : 'Lead Assigned',
        description: agentName ? `Assigned to ${agentName}` : undefined,
        created_by: assignedById,
      },
    });
  }

  async assignLead(leadId: string, agentId: string, userId: string) {
    const agent = await this.prisma.crmAgent.findUnique({
      where: { user_id: agentId },
      include: { user: true },
    });
    if (!agent || agent.status !== 'ACTIVE') {
      throw new BadRequestException('Agent not found or not active');
    }
    const lead = await this.prisma.crmLead.findFirst({ where: { id: leadId, is_deleted: false } });
    if (!lead) throw new NotFoundException('Lead not found');

    await this.prisma.crmLead.update({
      where: { id: leadId },
      data: { assigned_to_id: agentId },
    });
    await this.recordAssignment(
      leadId,
      lead.assigned_to_id,
      agentId,
      userId,
      lead.assigned_to_id ? 'REASSIGNMENT' : 'MANUAL_ASSIGNMENT',
      undefined,
      agent.user.name,
    );
    return { success: true, assignedTo: agent.user.name };
  }

  async bulkAssign(leadIds: string[], agentId: string, userId: string) {
    if (!leadIds.length) throw new BadRequestException('No leads selected');
    const agent = await this.prisma.crmAgent.findUnique({
      where: { user_id: agentId },
      include: { user: true },
    });
    if (!agent || agent.status !== 'ACTIVE') {
      throw new BadRequestException('Agent not found or not active');
    }

    const leads = await this.prisma.crmLead.findMany({
      where: { id: { in: leadIds }, is_deleted: false },
    });

    for (const lead of leads) {
      await this.prisma.crmLead.update({
        where: { id: lead.id },
        data: { assigned_to_id: agentId },
      });
      await this.recordAssignment(
        lead.id,
        lead.assigned_to_id,
        agentId,
        userId,
        'BULK_ASSIGNMENT',
        undefined,
        agent.user.name,
      );
    }

    return { success: true, count: leads.length, assignedTo: agent.user.name };
  }

  async reassignLead(leadId: string, agentId: string, userId: string, reason?: string) {
    const agent = await this.prisma.crmAgent.findUnique({
      where: { user_id: agentId },
      include: { user: true },
    });
    if (!agent || agent.status !== 'ACTIVE') {
      throw new BadRequestException('Agent not found or not active');
    }
    const lead = await this.prisma.crmLead.findFirst({ where: { id: leadId, is_deleted: false } });
    if (!lead) throw new NotFoundException('Lead not found');

    await this.prisma.crmLead.update({
      where: { id: leadId },
      data: { assigned_to_id: agentId },
    });
    await this.recordAssignment(
      leadId,
      lead.assigned_to_id,
      agentId,
      userId,
      'REASSIGNMENT',
      reason,
      agent.user.name,
    );
    return { success: true, assignedTo: agent.user.name };
  }

  async getAssignmentHistory(leadId: string) {
    const rows = await this.prisma.crmLeadAssignment.findMany({
      where: { lead_id: leadId },
      orderBy: { created_at: 'desc' },
      include: { assigned_by: { select: { name: true } } },
    });

    const agentIds = [
      ...new Set(
        rows.flatMap((r) => [r.previous_agent_id, r.new_agent_id].filter(Boolean) as string[]),
      ),
    ];
    const users = agentIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: agentIds } },
          select: { id: true, name: true },
        })
      : [];
    const nameMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    return rows.map((r) => ({
      id: r.id,
      previousAgentId: r.previous_agent_id,
      previousAgentName: r.previous_agent_id ? nameMap[r.previous_agent_id] : undefined,
      newAgentId: r.new_agent_id,
      newAgentName: r.new_agent_id ? nameMap[r.new_agent_id] : undefined,
      assignedByName: r.assigned_by?.name,
      reason: r.reason,
      assignmentType: r.assignment_type,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async bulkUpdate(
    leadIds: string[],
    data: { leadStatus?: string; priority?: string; tags?: string[] },
  ) {
    if (!leadIds.length) throw new BadRequestException('No leads selected');
    const update: Record<string, unknown> = {};
    if (data.leadStatus) update.lead_status = data.leadStatus;
    if (data.priority) update.priority = data.priority;
    if (data.tags) update.tags = data.tags;

    await this.prisma.crmLead.updateMany({
      where: { id: { in: leadIds }, is_deleted: false },
      data: update,
    });
    return { success: true, count: leadIds.length };
  }

  async bulkDelete(leadIds: string[]) {
    if (!leadIds.length) throw new BadRequestException('No leads selected');
    await this.prisma.crmLead.updateMany({
      where: { id: { in: leadIds } },
      data: { is_deleted: true },
    });
    return { success: true, count: leadIds.length };
  }

  async bulkAutoAssign(leadIds: string[], userId: string) {
    const agents = await this.getAgents(true);
    if (!agents.length) throw new BadRequestException('No active agents');
    const perAgent = Math.ceil(leadIds.length / agents.length);
    let idx = 0;
    let assigned = 0;
    for (const agent of agents) {
      const batch = leadIds.slice(idx, idx + perAgent);
      idx += perAgent;
      if (!batch.length) break;
      await this.bulkAssign(batch, agent.userId, userId);
      assigned += batch.length;
    }
    return { success: true, count: assigned, strategy: 'EQUAL_DISTRIBUTION' };
  }

  async importPreview(fileName: string, rows: Record<string, string>[], userId: string) {
    const validated = rows.map((raw, i) => validateImportRow(normalizeImportRow(raw), i + 2));

    const emails = validated.filter((r) => r.email).map((r) => r.email.toLowerCase());
    const phones = validated.filter((r) => r.phone).map((r) => r.phone);

    const existing = await this.prisma.crmLead.findMany({
      where: {
        is_deleted: false,
        OR: [
          emails.length ? { email: { in: emails, mode: 'insensitive' } } : undefined,
          phones.length ? { phone: { in: phones } } : undefined,
        ].filter(Boolean) as never[],
      },
      select: { email: true, phone: true, company: true },
    });

    const existingEmails = new Set(existing.map((e) => e.email.toLowerCase()));
    const existingPhones = new Set(existing.map((e) => e.phone));

    const preview = validated.map((row) => {
      let status = row.status;
      if (row.email && existingEmails.has(row.email.toLowerCase())) status = 'DUPLICATE';
      else if (row.phone && existingPhones.has(row.phone)) status = 'DUPLICATE';
      return { ...row, status: row.errors.length ? 'ERROR' : status };
    });

    const job = await this.prisma.crmImportJob.create({
      data: {
        file_name: fileName,
        uploaded_by_id: userId,
        status: 'READY',
        total_rows: preview.length,
        preview_json: preview as never,
        successful_rows: preview.filter((r) => r.status === 'VALID').length,
        duplicate_rows: preview.filter((r) => r.status === 'DUPLICATE').length,
        failed_rows: preview.filter((r) => r.status === 'ERROR').length,
        warning_rows: preview.filter((r) => r.status === 'WARNING').length,
      },
    });

    return {
      importJobId: job.id,
      totalRows: preview.length,
      valid: preview.filter((r) => r.status === 'VALID').length,
      warnings: preview.filter((r) => r.status === 'WARNING').length,
      duplicates: preview.filter((r) => r.status === 'DUPLICATE').length,
      errors: preview.filter((r) => r.status === 'ERROR').length,
      preview: preview.slice(0, 100),
    };
  }

  async importConfirm(
    importJobId: string,
    userId: string,
    duplicateStrategy: 'SKIP' | 'UPDATE' | 'IMPORT_AS_NEW' = 'SKIP',
  ) {
    const job = await this.prisma.crmImportJob.findUnique({ where: { id: importJobId } });
    if (!job) throw new NotFoundException('Import job not found');
    const preview = (job.preview_json as Array<ReturnType<typeof validateImportRow>>) ?? [];

    await this.prisma.crmImportJob.update({
      where: { id: importJobId },
      data: { status: 'PROCESSING', started_at: new Date(), duplicate_strategy: duplicateStrategy },
    });

    let imported = 0;
    let duplicates = 0;
    let failed = 0;

    for (const row of preview) {
      if (row.status === 'ERROR') {
        failed++;
        await this.prisma.crmImportError.create({
          data: {
            import_job_id: importJobId,
            row_number: row.rowNumber,
            error: row.errors.join('; '),
            suggested_fix: 'Fix validation errors and re-import',
          },
        });
        continue;
      }

      const existing = await this.prisma.crmLead.findFirst({
        where: {
          is_deleted: false,
          OR: [
            row.email ? { email: { equals: row.email, mode: 'insensitive' } } : undefined,
            row.phone ? { phone: row.phone } : undefined,
          ].filter(Boolean) as never[],
        },
      });

      if (existing) {
        if (duplicateStrategy === 'SKIP') {
          duplicates++;
          continue;
        }
        if (duplicateStrategy === 'UPDATE') {
          await this.prisma.crmLead.update({
            where: { id: existing.id },
            data: {
              first_name: row.firstName,
              last_name: row.lastName,
              phone: row.phone || existing.phone,
              company: row.company,
              lead_type: row.leadType,
              lead_source: row.leadSource,
              priority: row.priority,
            },
          });
          imported++;
          continue;
        }
      }

      let assignedToId: string | undefined;
      if (row.assignedAgentEmail) {
        const agentUser = await this.prisma.user.findFirst({
          where: { email: { equals: row.assignedAgentEmail, mode: 'insensitive' } },
          include: { crm_agent_profile: true },
        });
        if (!agentUser || agentUser.crm_agent_profile?.status !== 'ACTIVE') {
          failed++;
          await this.prisma.crmImportError.create({
            data: {
              import_job_id: importJobId,
              row_number: row.rowNumber,
              error: 'Invalid or inactive assigned agent email',
              suggested_fix: 'Use an active agent email',
            },
          });
          continue;
        }
        assignedToId = agentUser.id;
      }

      const created = await this.prisma.crmLead.create({
        data: {
          first_name: row.firstName,
          last_name: row.lastName || '',
          email: row.email || `${row.phone}@import.local`,
          phone: row.phone || 'N/A',
          company: row.company,
          lead_type: row.leadType,
          lead_source: row.leadSource,
          priority: row.priority,
          lead_status: row.leadStatus,
          assigned_to_id: assignedToId,
          created_by_id: userId,
          deal_currency: 'INR',
          deal_value: row.dealValue,
          next_follow_up_date: row.nextFollowUpDate,
          description: row.description,
          tags: row.tags,
          timeline_events: {
            create: {
              type: 'lead_created',
              title: 'Lead Imported',
              description: `Imported from ${job.file_name}`,
              created_by: userId,
            },
          },
        },
      });

      if (assignedToId) {
        await this.recordAssignment(
          created.id,
          null,
          assignedToId,
          userId,
          'IMPORT_ASSIGNMENT',
          undefined,
          undefined,
        );
      }
      imported++;
    }

    const finalStatus = failed > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';
    await this.prisma.crmImportJob.update({
      where: { id: importJobId },
      data: {
        status: finalStatus,
        successful_rows: imported,
        duplicate_rows: duplicates,
        failed_rows: failed,
        completed_at: new Date(),
      },
    });

    return {
      importJobId,
      imported,
      duplicates,
      failed,
      status: finalStatus,
    };
  }

  async getImportHistory() {
    const jobs = await this.prisma.crmImportJob.findMany({
      orderBy: { created_at: 'desc' },
      take: 50,
      include: { uploaded_by: { select: { name: true } } },
    });
    return jobs.map((j) => ({
      id: j.id,
      fileName: j.file_name,
      importedBy: j.uploaded_by.name,
      date: j.created_at.toISOString(),
      totalRows: j.total_rows,
      imported: j.successful_rows,
      duplicates: j.duplicate_rows,
      failed: j.failed_rows,
      status: j.status,
    }));
  }

  async getImportJob(id: string) {
    const job = await this.prisma.crmImportJob.findUnique({
      where: { id },
      include: {
        uploaded_by: { select: { name: true } },
        errors: { orderBy: { row_number: 'asc' } },
      },
    });
    if (!job) throw new NotFoundException('Import job not found');
    return {
      id: job.id,
      fileName: job.file_name,
      uploadedBy: job.uploaded_by.name,
      uploadedDate: job.created_at.toISOString(),
      completedAt: job.completed_at?.toISOString(),
      totalRecords: job.total_rows,
      successfulRecords: job.successful_rows,
      duplicateRecords: job.duplicate_rows,
      failedRecords: job.failed_rows,
      status: job.status,
      errors: job.errors.map((e) => ({
        rowNumber: e.row_number,
        error: e.error,
        suggestedFix: e.suggested_fix,
      })),
    };
  }

  async getImportErrorsCsv(id: string) {
    const job = await this.getImportJob(id);
    const lines = ['Row Number,Error,Suggested Fix'];
    for (const e of job.errors) {
      lines.push(`${e.rowNumber},"${e.error.replace(/"/g, '""')}","${(e.suggestedFix ?? '').replace(/"/g, '""')}"`);
    }
    return lines.join('\n');
  }

  private buildWhereFromQuery(query: CrmLeadQueryDto) {
    const where: Record<string, unknown> = { is_deleted: false };
    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { first_name: { contains: q, mode: 'insensitive' } },
        { last_name: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (query.leadStatus && query.leadStatus !== 'all') where.lead_status = query.leadStatus;
    if (query.leadType && query.leadType !== 'all') where.lead_type = query.leadType;
    if (query.priority && query.priority !== 'all') where.priority = query.priority;
    if (query.assignedToId && query.assignedToId !== 'all') where.assigned_to_id = query.assignedToId;
    if (query.source && query.source !== 'all') where.lead_source = query.source;
    return where;
  }

  async exportLeads(
    userId: string,
    opts: {
      leadIds?: string[];
      filters?: CrmLeadQueryDto;
      fields?: string[];
    },
  ) {
    const fields = opts.fields?.length
      ? opts.fields
      : ['firstName', 'lastName', 'email', 'phone', 'company', 'leadStatus', 'priority', 'assignedToName', 'createdAt'];

    let leads;
    if (opts.leadIds?.length) {
      leads = await this.prisma.crmLead.findMany({
        where: { id: { in: opts.leadIds }, is_deleted: false },
        include: { assigned_to: { select: { name: true } } },
      });
    } else {
      leads = await this.prisma.crmLead.findMany({
        where: this.buildWhereFromQuery(opts.filters ?? {}),
        include: { assigned_to: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
        take: 5000,
      });
    }

    const mapped = leads.map((l) => ({
      firstName: l.first_name,
      lastName: l.last_name,
      email: l.email,
      phone: l.phone,
      company: l.company,
      leadType: l.lead_type,
      leadSource: l.lead_source,
      leadStatus: l.lead_status,
      priority: l.priority,
      assignedToName: l.assigned_to?.name ?? '',
      createdAt: l.created_at.toISOString(),
      updatedAt: l.updated_at.toISOString(),
    }));

    const csv = leadsToCsv(
      mapped.map((l) => {
        const row: Record<string, unknown> = {};
        for (const f of fields) {
          row[f] = EXPORT_FIELD_MAP[f]?.(l) ?? (l as Record<string, unknown>)[f];
        }
        return row;
      }),
      fields,
    );

    const job = await this.prisma.crmExportJob.create({
      data: {
        file_name: `crm-export-${Date.now()}.csv`,
        requested_by_id: userId,
        filters_json: (opts.filters ?? {}) as never,
        selected_fields: fields as never,
        record_count: mapped.length,
        status: 'COMPLETED',
        file_content: csv,
        completed_at: new Date(),
      },
    });

    return { exportJobId: job.id, recordCount: mapped.length, csv };
  }

  async getExportHistory() {
    const jobs = await this.prisma.crmExportJob.findMany({
      orderBy: { created_at: 'desc' },
      take: 50,
      include: { requested_by: { select: { name: true } } },
    });
    return jobs.map((j) => ({
      id: j.id,
      fileName: j.file_name,
      requestedBy: j.requested_by.name,
      date: j.created_at.toISOString(),
      recordCount: j.record_count,
      status: j.status,
    }));
  }

  async getExportDownload(id: string) {
    const job = await this.prisma.crmExportJob.findUnique({ where: { id } });
    if (!job || !job.file_content) throw new NotFoundException('Export not found');
    return { fileName: job.file_name, csv: job.file_content };
  }

  async getLeadIdsByFilters(query: CrmLeadQueryDto) {
    const leads = await this.prisma.crmLead.findMany({
      where: this.buildWhereFromQuery(query),
      select: { id: true },
    });
    return leads.map((l) => l.id);
  }
}
