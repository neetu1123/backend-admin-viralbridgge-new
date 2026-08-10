import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCrmFollowUpDto,
  CreateCrmLeadDto,
  CrmLeadQueryDto,
  UpdateCrmLeadDto,
} from './crm.dto';

const PRIORITY_ORDER: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

type LeadWithRelations = Prisma.CrmLeadGetPayload<{
  include: {
    assigned_to: true;
    notes: true;
    follow_ups: true;
    timeline_events: true;
    attachments: true;
  };
}>;

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveFollowUpStatus(date: string, time: string, completed: boolean): string {
    if (completed) return 'completed';
    const now = new Date();
    const followUp = new Date(`${date}T${time || '00:00'}`);
    const todayStr = now.toISOString().slice(0, 10);
    if (date === todayStr) return 'today';
    if (followUp < now) return 'overdue';
    return 'upcoming';
  }

  private mapLead(lead: LeadWithRelations) {
    return {
      id: lead.id,
      firstName: lead.first_name,
      lastName: lead.last_name,
      profilePhoto: lead.profile_photo ?? undefined,
      gender: lead.gender ?? undefined,
      dateOfBirth: lead.date_of_birth ?? undefined,
      email: lead.email,
      phone: lead.phone,
      alternatePhone: lead.alternate_phone ?? undefined,
      whatsapp: lead.whatsapp ?? undefined,
      website: lead.website ?? undefined,
      company: lead.company,
      jobTitle: lead.job_title ?? undefined,
      industry: lead.industry ?? undefined,
      companySize: lead.company_size ?? undefined,
      gstNumber: lead.gst_number ?? undefined,
      country: lead.country ?? undefined,
      state: lead.state ?? undefined,
      city: lead.city ?? undefined,
      postalCode: lead.postal_code ?? undefined,
      address: lead.address ?? undefined,
      leadType: lead.lead_type,
      leadSource: lead.lead_source,
      priority: lead.priority,
      leadStatus: lead.lead_status,
      assignedToId: lead.assigned_to_id ?? undefined,
      assignedToName: lead.assigned_to?.name ?? undefined,
      dealCurrency: lead.deal_currency,
      dealValue: lead.deal_value ?? undefined,
      nextFollowUpDate: lead.next_follow_up_date ?? undefined,
      nextFollowUpTime: lead.next_follow_up_time ?? undefined,
      description: lead.description ?? undefined,
      internalNotes: lead.internal_notes ?? undefined,
      tags: lead.tags ?? [],
      notes: lead.notes
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .map((n) => ({
          id: n.id,
          content: n.content,
          createdBy: n.created_by,
          createdAt: n.created_at.toISOString(),
          updatedAt: n.updated_at.getTime() !== n.created_at.getTime() ? n.updated_at.toISOString() : undefined,
        })),
      followUps: lead.follow_ups.map((fu) => ({
        id: fu.id,
        title: fu.title,
        date: fu.date,
        time: fu.time,
        status: this.resolveFollowUpStatus(fu.date, fu.time, fu.status === 'completed'),
        notes: fu.notes ?? undefined,
        createdAt: fu.created_at.toISOString(),
      })),
      attachments: lead.attachments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size ?? '',
        uploadedAt: a.uploaded_at.toISOString(),
      })),
      timeline: lead.timeline_events
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .map((e) => ({
          id: e.id,
          type: e.type,
          title: e.title,
          description: e.description ?? undefined,
          createdBy: e.created_by ?? undefined,
          createdAt: e.created_at.toISOString(),
        })),
      createdAt: lead.created_at.toISOString(),
      updatedAt: lead.updated_at.toISOString(),
    };
  }

  private leadInclude() {
    return {
      assigned_to: true,
      notes: true,
      follow_ups: true,
      timeline_events: true,
      attachments: true,
    } as const;
  }

  private buildWhere(query: CrmLeadQueryDto): Prisma.CrmLeadWhereInput {
    const where: Prisma.CrmLeadWhereInput = { is_deleted: false };

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
    if (query.dateFrom) where.created_at = { ...(where.created_at as object), gte: new Date(`${query.dateFrom}T00:00:00.000Z`) };
    if (query.dateTo) where.created_at = { ...(where.created_at as object), lte: new Date(`${query.dateTo}T23:59:59.999Z`) };

    return where;
  }

  private buildOrderBy(sort?: string): Prisma.CrmLeadOrderByWithRelationInput {
    switch (sort) {
      case 'oldest':
        return { created_at: 'asc' };
      case 'updated':
        return { updated_at: 'desc' };
      case 'priority':
        return { priority: 'desc' };
      default:
        return { created_at: 'desc' };
    }
  }

  async getSummary() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const [totalLeads, newLeads, qualifiedLeads, convertedLeads, lostLeads, todaysFollowUps] =
      await Promise.all([
        this.prisma.crmLead.count({ where: { is_deleted: false } }),
        this.prisma.crmLead.count({ where: { is_deleted: false, lead_status: 'New' } }),
        this.prisma.crmLead.count({ where: { is_deleted: false, lead_status: 'Qualified' } }),
        this.prisma.crmLead.count({ where: { is_deleted: false, lead_status: 'Won' } }),
        this.prisma.crmLead.count({ where: { is_deleted: false, lead_status: 'Lost' } }),
        this.prisma.crmLead.count({
          where: { is_deleted: false, next_follow_up_date: todayStr },
        }),
      ]);

    return { totalLeads, newLeads, qualifiedLeads, convertedLeads, lostLeads, todaysFollowUps };
  }

  async getLeads(query: CrmLeadQueryDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '100', 10) || 100));
    const where = this.buildWhere(query);

    let leads = await this.prisma.crmLead.findMany({
      where,
      include: this.leadInclude(),
      orderBy: this.buildOrderBy(query.sort),
    });

    if (query.sort === 'priority') {
      leads = leads.sort(
        (a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0),
      );
    }

    const total = leads.length;
    const start = (page - 1) * limit;
    const paginated = leads.slice(start, start + limit);

    return {
      data: paginated.map((l) => this.mapLead(l)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getLead(id: string) {
    const lead = await this.prisma.crmLead.findFirst({
      where: { id, is_deleted: false },
      include: this.leadInclude(),
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.mapLead(lead);
  }

  async createLead(dto: CreateCrmLeadDto, userId?: string, userName?: string) {
    const lead = await this.prisma.crmLead.create({
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        profile_photo: dto.profilePhoto,
        gender: dto.gender,
        date_of_birth: dto.dateOfBirth,
        email: dto.email,
        phone: dto.phone,
        alternate_phone: dto.alternatePhone,
        whatsapp: dto.whatsapp,
        website: dto.website,
        company: dto.company,
        job_title: dto.jobTitle,
        industry: dto.industry,
        company_size: dto.companySize,
        gst_number: dto.gstNumber,
        country: dto.country,
        state: dto.state,
        city: dto.city,
        postal_code: dto.postalCode,
        address: dto.address,
        lead_type: dto.leadType,
        lead_source: dto.leadSource,
        priority: dto.priority,
        lead_status: dto.leadStatus || 'New',
        assigned_to_id: dto.assignedToId || null,
        created_by_id: userId || null,
        deal_currency: dto.dealCurrency || 'INR',
        deal_value: dto.dealValue,
        next_follow_up_date: dto.nextFollowUpDate,
        next_follow_up_time: dto.nextFollowUpTime,
        description: dto.description,
        internal_notes: dto.internalNotes,
        tags: dto.tags ?? [],
        timeline_events: {
          create: {
            type: 'lead_created',
            title: 'Lead Created',
            description: `${dto.firstName} ${dto.lastName} from ${dto.company}`,
            created_by: userName,
          },
        },
        follow_ups: dto.nextFollowUpDate
          ? {
              create: {
                title: 'Initial follow-up',
                date: dto.nextFollowUpDate,
                time: dto.nextFollowUpTime || '10:00',
                status: this.resolveFollowUpStatus(
                  dto.nextFollowUpDate,
                  dto.nextFollowUpTime || '10:00',
                  false,
                ),
              },
            }
          : undefined,
      },
      include: this.leadInclude(),
    });

    return this.mapLead(lead);
  }

  async updateLead(id: string, dto: UpdateCrmLeadDto, userName?: string) {
    const existing = await this.prisma.crmLead.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existing) throw new NotFoundException('Lead not found');

    const statusChanged = dto.leadStatus && dto.leadStatus !== existing.lead_status;

    const lead = await this.prisma.crmLead.update({
      where: { id },
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        profile_photo: dto.profilePhoto,
        gender: dto.gender,
        date_of_birth: dto.dateOfBirth,
        email: dto.email,
        phone: dto.phone,
        alternate_phone: dto.alternatePhone,
        whatsapp: dto.whatsapp,
        website: dto.website,
        company: dto.company,
        job_title: dto.jobTitle,
        industry: dto.industry,
        company_size: dto.companySize,
        gst_number: dto.gstNumber,
        country: dto.country,
        state: dto.state,
        city: dto.city,
        postal_code: dto.postalCode,
        address: dto.address,
        lead_type: dto.leadType,
        lead_source: dto.leadSource,
        priority: dto.priority,
        lead_status: dto.leadStatus,
        assigned_to_id: dto.assignedToId || null,
        deal_currency: dto.dealCurrency || 'INR',
        deal_value: dto.dealValue,
        next_follow_up_date: dto.nextFollowUpDate,
        next_follow_up_time: dto.nextFollowUpTime,
        description: dto.description,
        internal_notes: dto.internalNotes,
        tags: dto.tags ?? [],
        timeline_events: {
          create: [
            ...(statusChanged
              ? [{
                  type: 'status_changed',
                  title: `Status Changed to ${dto.leadStatus}`,
                  description: `${existing.lead_status} → ${dto.leadStatus}`,
                  created_by: userName,
                }]
              : []),
            {
              type: 'lead_updated',
              title: 'Lead Updated',
              created_by: userName,
            },
          ],
        },
      },
      include: this.leadInclude(),
    });

    return this.mapLead(lead);
  }

  async deleteLead(id: string) {
    const existing = await this.prisma.crmLead.findFirst({ where: { id, is_deleted: false } });
    if (!existing) throw new NotFoundException('Lead not found');
    await this.prisma.crmLead.update({ where: { id }, data: { is_deleted: true } });
    return { success: true };
  }

  async archiveLead(id: string, userName?: string) {
    return this.updateLead(
      id,
      {
        ...await this.getLeadInputFromDb(id),
        leadStatus: 'Inactive',
      },
      userName,
    );
  }

  private async getLeadInputFromDb(id: string): Promise<UpdateCrmLeadDto> {
    const lead = await this.prisma.crmLead.findUniqueOrThrow({ where: { id } });
    return {
      firstName: lead.first_name,
      lastName: lead.last_name,
      profilePhoto: lead.profile_photo ?? undefined,
      gender: lead.gender ?? undefined,
      dateOfBirth: lead.date_of_birth ?? undefined,
      email: lead.email,
      phone: lead.phone,
      alternatePhone: lead.alternate_phone ?? undefined,
      whatsapp: lead.whatsapp ?? undefined,
      website: lead.website ?? undefined,
      company: lead.company,
      jobTitle: lead.job_title ?? undefined,
      industry: lead.industry ?? undefined,
      companySize: lead.company_size ?? undefined,
      gstNumber: lead.gst_number ?? undefined,
      country: lead.country ?? undefined,
      state: lead.state ?? undefined,
      city: lead.city ?? undefined,
      postalCode: lead.postal_code ?? undefined,
      address: lead.address ?? undefined,
      leadType: lead.lead_type,
      leadSource: lead.lead_source,
      priority: lead.priority,
      leadStatus: lead.lead_status,
      assignedToId: lead.assigned_to_id ?? undefined,
      dealCurrency: lead.deal_currency,
      dealValue: lead.deal_value ?? undefined,
      nextFollowUpDate: lead.next_follow_up_date ?? undefined,
      nextFollowUpTime: lead.next_follow_up_time ?? undefined,
      description: lead.description ?? undefined,
      internalNotes: lead.internal_notes ?? undefined,
      tags: lead.tags ?? [],
    };
  }

  async addNote(leadId: string, content: string, createdBy: string) {
    await this.getLead(leadId);
    const note = await this.prisma.crmNote.create({
      data: { lead_id: leadId, content, created_by: createdBy },
    });
    await this.prisma.crmTimelineEvent.create({
      data: {
        lead_id: leadId,
        type: 'note_added',
        title: 'Note Added',
        description: content.slice(0, 80),
        created_by: createdBy,
      },
    });
    return {
      id: note.id,
      content: note.content,
      createdBy: note.created_by,
      createdAt: note.created_at.toISOString(),
    };
  }

  async updateNote(leadId: string, noteId: string, content: string) {
    const note = await this.prisma.crmNote.findFirst({ where: { id: noteId, lead_id: leadId } });
    if (!note) throw new NotFoundException('Note not found');
    await this.prisma.crmNote.update({ where: { id: noteId }, data: { content } });
    return { success: true };
  }

  async deleteNote(leadId: string, noteId: string) {
    const note = await this.prisma.crmNote.findFirst({ where: { id: noteId, lead_id: leadId } });
    if (!note) throw new NotFoundException('Note not found');
    await this.prisma.crmNote.delete({ where: { id: noteId } });
    return { success: true };
  }

  async addFollowUp(leadId: string, dto: CreateCrmFollowUpDto) {
    await this.getLead(leadId);
    const followUp = await this.prisma.crmFollowUp.create({
      data: {
        lead_id: leadId,
        title: dto.title,
        date: dto.date,
        time: dto.time,
        notes: dto.notes,
        status: this.resolveFollowUpStatus(dto.date, dto.time, false),
      },
    });
    await this.prisma.crmLead.update({
      where: { id: leadId },
      data: {
        next_follow_up_date: dto.date,
        next_follow_up_time: dto.time,
      },
    });
    await this.prisma.crmTimelineEvent.create({
      data: {
        lead_id: leadId,
        type: 'call_scheduled',
        title: 'Follow-up Scheduled',
        description: dto.title,
      },
    });
    return {
      id: followUp.id,
      title: followUp.title,
      date: followUp.date,
      time: followUp.time,
      status: followUp.status,
      notes: followUp.notes ?? undefined,
      createdAt: followUp.created_at.toISOString(),
    };
  }

  async completeFollowUp(leadId: string, followUpId: string) {
    const followUp = await this.prisma.crmFollowUp.findFirst({
      where: { id: followUpId, lead_id: leadId },
    });
    if (!followUp) throw new NotFoundException('Follow-up not found');
    await this.prisma.crmFollowUp.update({
      where: { id: followUpId },
      data: { status: 'completed' },
    });
    await this.prisma.crmTimelineEvent.create({
      data: {
        lead_id: leadId,
        type: 'follow_up_completed',
        title: 'Follow-up Completed',
      },
    });
    return { success: true };
  }

  async getAssignees() {
    const admins = await this.prisma.user.findMany({
      where: { role_id: { not: null } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    return admins;
  }
}
