import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminCaseQueryDto,
  AdminNoteDto,
  AdminUpdateCaseDto,
  CreateSupportCaseDto,
  ResolveSupportDto,
} from './support.dto';
import { seedSupportData } from './support.seed';

@Injectable()
export class SupportService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await seedSupportData(this.prisma);
  }

  private normalizeRole(role?: string): 'BRAND' | 'CREATOR' {
    const r = (role ?? '').toUpperCase();
    return r === 'BRAND' ? 'BRAND' : 'CREATOR';
  }

  private async nextCaseNumber(): Promise<string> {
    const count = await this.prisma.supportCase.count();
    return `VB-${String(10000 + count + 1)}`;
  }

  private mapCategory(cat: {
    id: string;
    role: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    subcategories?: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      sort_order: number;
      issues?: Array<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        keywords: string[];
        solution: string | null;
        action_type: string | null;
        action_url: string | null;
        requires_admin: boolean;
        priority: string;
        case_type: string;
      }>;
    }>;
  }) {
    return {
      id: cat.id,
      role: cat.role,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      sortOrder: cat.sort_order,
      subcategories: (cat.subcategories ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        sortOrder: s.sort_order,
        issues: (s.issues ?? []).map((i) => ({
          id: i.id,
          title: i.title,
          slug: i.slug,
          description: i.description,
          keywords: i.keywords,
          solution: i.solution,
          actionType: i.action_type,
          actionUrl: i.action_url,
          requiresAdmin: i.requires_admin,
          priority: i.priority,
          caseType: i.case_type,
        })),
      })),
    };
  }

  async getCategories(userRole: string) {
    const role = this.normalizeRole(userRole);
    const categories = await this.prisma.supportCategory.findMany({
      where: { role, is_active: true },
      orderBy: { sort_order: 'asc' },
      include: {
        subcategories: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
          include: {
            issues: {
              where: { is_active: true },
              orderBy: { title: 'asc' },
            },
          },
        },
      },
    });
    return categories.map((c) => this.mapCategory(c));
  }

  async getCategory(categoryId: string, userRole: string) {
    const role = this.normalizeRole(userRole);
    const category = await this.prisma.supportCategory.findFirst({
      where: { id: categoryId, role, is_active: true },
      include: {
        subcategories: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
          include: {
            issues: { where: { is_active: true }, orderBy: { title: 'asc' } },
          },
        },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return this.mapCategory(category);
  }

  async getIssue(issueId: string, userRole: string) {
    const role = this.normalizeRole(userRole);
    const issue = await this.prisma.supportIssue.findFirst({
      where: { id: issueId, is_active: true },
      include: {
        subcategory: {
          include: { category: true },
        },
      },
    });
    if (!issue || issue.subcategory.category.role !== role) {
      throw new NotFoundException('Issue not found');
    }
    return {
      id: issue.id,
      title: issue.title,
      slug: issue.slug,
      description: issue.description,
      keywords: issue.keywords,
      solution: issue.solution,
      actionType: issue.action_type,
      actionUrl: issue.action_url,
      requiresAdmin: issue.requires_admin,
      priority: issue.priority,
      caseType: issue.case_type,
      category: {
        id: issue.subcategory.category.id,
        name: issue.subcategory.category.name,
        slug: issue.subcategory.category.slug,
      },
      subcategory: {
        id: issue.subcategory.id,
        name: issue.subcategory.name,
        slug: issue.subcategory.slug,
      },
    };
  }

  async search(userRole: string, query: string) {
    const role = this.normalizeRole(userRole);
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const issues = await this.prisma.supportIssue.findMany({
      where: {
        is_active: true,
        subcategory: { category: { role, is_active: true } },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { solution: { contains: q, mode: 'insensitive' } },
          { keywords: { hasSome: [q] } },
        ],
      },
      include: {
        subcategory: { include: { category: true } },
      },
      take: 20,
    });

    return issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      slug: issue.slug,
      categoryName: issue.subcategory.category.name,
      categoryId: issue.subcategory.category.id,
      subcategoryName: issue.subcategory.name,
      solution: issue.solution,
      requiresAdmin: issue.requires_admin,
    }));
  }

  async resolve(userId: string, userRole: string, dto: ResolveSupportDto) {
    const issue = await this.getIssue(dto.issueId, userRole);
    const context: Record<string, unknown> = { issueTitle: issue.title };

    if (dto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: dto.campaignId },
        include: { brand: { include: { user: true } } },
      });
      if (!campaign) throw new NotFoundException('Campaign not found');
      const role = this.normalizeRole(userRole);
      if (role === 'BRAND' && campaign.brand.user_id !== userId) {
        throw new ForbiddenException('Not authorized for this campaign');
      }
      context.campaign = {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        budget: campaign.budget,
      };
    }

    if (issue.solution && !issue.requiresAdmin) {
      return {
        resolved: true,
        solution: issue.solution,
        actionType: issue.actionType,
        actionUrl: issue.actionUrl,
        context,
      };
    }

    return {
      resolved: false,
      requiresCase: true,
      issue,
      context,
      message: issue.solution ?? 'This issue requires support team assistance.',
    };
  }

  async createCase(userId: string, userRole: string, dto: CreateSupportCaseDto) {
    const role = this.normalizeRole(userRole);
    let issueMeta: { priority: string; caseType: string; categoryId?: string; subcategoryId?: string } = {
      priority: dto.priority ?? 'MEDIUM',
      caseType: dto.caseType ?? 'GENERAL_SUPPORT',
      categoryId: dto.categoryId,
      subcategoryId: dto.subcategoryId,
    };

    if (dto.issueId) {
      const issue = await this.getIssue(dto.issueId, role);
      issueMeta = {
        priority: issue.priority,
        caseType: issue.caseType,
        categoryId: issue.category.id,
        subcategoryId: issue.subcategory.id,
      };
    }

    const caseNumber = await this.nextCaseNumber();
    const supportCase = await this.prisma.supportCase.create({
      data: {
        case_number: caseNumber,
        user_id: userId,
        user_role: role,
        category_id: issueMeta.categoryId ?? dto.categoryId,
        subcategory_id: issueMeta.subcategoryId ?? dto.subcategoryId,
        issue_id: dto.issueId,
        case_type: issueMeta.caseType,
        priority: issueMeta.priority,
        status: 'OPEN',
        subject: dto.subject,
        description: dto.description,
        campaign_id: dto.campaignId,
        payment_id: dto.paymentId,
        transaction_id: dto.transactionId,
        context_json: (dto.contextJson ?? {}) as Prisma.InputJsonValue,
        events: {
          create: {
            actor_id: userId,
            event_type: 'CASE_CREATED',
            new_value: 'OPEN',
          },
        },
        messages: {
          create: {
            sender_id: userId,
            sender_role: role,
            message: dto.description,
          },
        },
      },
      include: this.caseInclude(),
    });

    return this.mapCase(supportCase);
  }

  async getUserCases(userId: string) {
    const cases = await this.prisma.supportCase.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
      include: this.caseInclude(),
    });
    return cases.map((c) => this.mapCase(c));
  }

  async getUserCase(userId: string, caseId: string) {
    const supportCase = await this.prisma.supportCase.findFirst({
      where: { id: caseId, user_id: userId },
      include: this.caseInclude(),
    });
    if (!supportCase) throw new NotFoundException('Case not found');
    return this.mapCase(supportCase, true);
  }

  async sendMessage(userId: string, userRole: string, caseId: string, message: string) {
    const supportCase = await this.prisma.supportCase.findFirst({
      where: { id: caseId, user_id: userId },
    });
    if (!supportCase) throw new NotFoundException('Case not found');

    const msg = await this.prisma.supportCaseMessage.create({
      data: {
        case_id: caseId,
        sender_id: userId,
        sender_role: this.normalizeRole(userRole),
        message,
      },
    });

    await this.prisma.supportCase.update({
      where: { id: caseId },
      data: { status: 'WAITING_FOR_ADMIN', updated_at: new Date() },
    });

    await this.prisma.supportCaseEvent.create({
      data: {
        case_id: caseId,
        actor_id: userId,
        event_type: 'USER_REPLIED',
      },
    });

    return {
      id: msg.id,
      message: msg.message,
      senderRole: msg.sender_role,
      createdAt: msg.created_at.toISOString(),
    };
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async getAdminSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [openCases, highPriority, unassigned, waitingForUser, resolvedToday] =
      await Promise.all([
        this.prisma.supportCase.count({ where: { status: 'OPEN' } }),
        this.prisma.supportCase.count({ where: { priority: 'URGENT', status: { not: 'CLOSED' } } }),
        this.prisma.supportCase.count({ where: { assigned_admin_id: null, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
        this.prisma.supportCase.count({ where: { status: 'WAITING_FOR_USER' } }),
        this.prisma.supportCase.count({ where: { resolved_at: { gte: today } } }),
      ]);
    return { openCases, highPriority, unassigned, waitingForUser, resolvedToday };
  }

  async getAdminCases(query: AdminCaseQueryDto, adminId?: string) {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(50, parseInt(query.limit || '20', 10) || 20);
    const where: Record<string, unknown> = {};

    if (query.status && query.status !== 'all') where.status = query.status;
    if (query.priority && query.priority !== 'all') where.priority = query.priority;
    if (query.caseType && query.caseType !== 'all') where.case_type = query.caseType;

    if (query.tab === 'open') where.status = { in: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_ADMIN', 'WAITING_FOR_USER', 'REOPENED'] };
    if (query.tab === 'my') where.assigned_admin_id = adminId;
    if (query.tab === 'unassigned') {
      where.assigned_admin_id = null;
      where.status = { notIn: ['CLOSED', 'RESOLVED'] };
    }
    if (query.tab === 'high') where.priority = { in: ['HIGH', 'URGENT'] };
    if (query.tab === 'payment') where.case_type = { in: ['PAYMENT', 'PAYMENT_DISPUTE', 'WITHDRAWAL'] };
    if (query.tab === 'technical') where.case_type = 'TECHNICAL';
    if (query.tab === 'resolved') where.status = { in: ['RESOLVED', 'CLOSED'] };

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { case_number: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, cases] = await Promise.all([
      this.prisma.supportCase.count({ where }),
      this.prisma.supportCase.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: this.caseInclude(),
      }),
    ]);

    return {
      data: cases.map((c) => this.mapCase(c)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getAdminCase(caseId: string) {
    const supportCase = await this.prisma.supportCase.findUnique({
      where: { id: caseId },
      include: {
        ...this.caseInclude(),
        notes: { include: { admin: { select: { id: true, name: true } } }, orderBy: { created_at: 'desc' } },
        events: { orderBy: { created_at: 'desc' } },
      },
    });
    if (!supportCase) throw new NotFoundException('Case not found');
    return this.mapCase(supportCase, true, true);
  }

  async adminUpdateCase(caseId: string, dto: AdminUpdateCaseDto, adminId: string) {
    const existing = await this.prisma.supportCase.findUnique({ where: { id: caseId } });
    if (!existing) throw new NotFoundException('Case not found');

    const events: Array<{ event_type: string; old_value?: string; new_value?: string; actor_id: string }> = [];

    if (dto.status && dto.status !== existing.status) {
      events.push({ event_type: 'STATUS_CHANGED', old_value: existing.status, new_value: dto.status, actor_id: adminId });
    }
    if (dto.priority && dto.priority !== existing.priority) {
      events.push({ event_type: 'PRIORITY_CHANGED', old_value: existing.priority, new_value: dto.priority, actor_id: adminId });
    }
    if (dto.assignedAdminId && dto.assignedAdminId !== existing.assigned_admin_id) {
      events.push({ event_type: 'CASE_ASSIGNED', new_value: dto.assignedAdminId, actor_id: adminId });
    }

    const updated = await this.prisma.supportCase.update({
      where: { id: caseId },
      data: {
        status: dto.status ?? existing.status,
        priority: dto.priority ?? existing.priority,
        assigned_admin_id: dto.assignedAdminId ?? existing.assigned_admin_id,
        resolved_at: dto.status === 'RESOLVED' ? new Date() : existing.resolved_at,
        events: { create: events },
      },
      include: this.caseInclude(),
    });

    return this.mapCase(updated, true, true);
  }

  async adminAssign(caseId: string, adminId: string, assignToId: string) {
    return this.adminUpdateCase(caseId, { assignedAdminId: assignToId, status: 'IN_PROGRESS' }, adminId);
  }

  async adminReply(caseId: string, adminId: string, message: string) {
    await this.prisma.supportCaseMessage.create({
      data: { case_id: caseId, sender_id: adminId, sender_role: 'ADMIN', message },
    });
    await this.prisma.supportCase.update({
      where: { id: caseId },
      data: { status: 'WAITING_FOR_USER', updated_at: new Date() },
    });
    await this.prisma.supportCaseEvent.create({
      data: { case_id: caseId, actor_id: adminId, event_type: 'ADMIN_REPLIED' },
    });
    return this.getAdminCase(caseId);
  }

  async adminAddNote(caseId: string, adminId: string, dto: AdminNoteDto) {
    await this.prisma.supportCaseNote.create({
      data: { case_id: caseId, admin_id: adminId, note: dto.note },
    });
    await this.prisma.supportCaseEvent.create({
      data: { case_id: caseId, actor_id: adminId, event_type: 'INTERNAL_NOTE_ADDED' },
    });
    return this.getAdminCase(caseId);
  }

  async adminResolve(caseId: string, adminId: string) {
    return this.adminUpdateCase(caseId, { status: 'RESOLVED' }, adminId);
  }

  async adminClose(caseId: string, adminId: string) {
    return this.adminUpdateCase(caseId, { status: 'CLOSED' }, adminId);
  }

  async adminReopen(caseId: string, adminId: string) {
    return this.adminUpdateCase(caseId, { status: 'REOPENED' }, adminId);
  }

  private caseInclude() {
    return {
      user: { select: { id: true, name: true, email: true } },
      assigned_admin: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { created_at: 'asc' as const } },
      attachments: true,
    };
  }

  private mapCase(
    c: {
      id: string;
      case_number: string;
      user_id: string;
      user_role: string;
      category_id: string | null;
      subcategory_id: string | null;
      issue_id: string | null;
      case_type: string;
      priority: string;
      status: string;
      subject: string;
      description: string;
      campaign_id: string | null;
      payment_id: string | null;
      transaction_id: string | null;
      context_json: unknown;
      created_at: Date;
      updated_at: Date;
      resolved_at: Date | null;
      user?: { id: string; name: string; email: string };
      assigned_admin?: { id: string; name: string; email: string } | null;
      messages?: Array<{ id: string; sender_id: string; sender_role: string; message: string; created_at: Date; read_at: Date | null }>;
      attachments?: Array<{ id: string; file_name: string; file_url: string; mime_type: string | null; created_at: Date }>;
      notes?: Array<{ id: string; note: string; created_at: Date; admin: { id: string; name: string } }>;
      events?: Array<{ id: string; event_type: string; old_value: string | null; new_value: string | null; created_at: Date }>;
    },
    includeMessages = false,
    includeAdmin = false,
  ) {
    return {
      id: c.id,
      caseNumber: c.case_number,
      userId: c.user_id,
      userRole: c.user_role,
      userName: c.user?.name ?? '',
      userEmail: c.user?.email ?? '',
      categoryId: c.category_id,
      subcategoryId: c.subcategory_id,
      issueId: c.issue_id,
      caseType: c.case_type,
      priority: c.priority,
      status: c.status,
      subject: c.subject,
      description: c.description,
      campaignId: c.campaign_id,
      paymentId: c.payment_id,
      transactionId: c.transaction_id,
      contextJson: c.context_json,
      assignedAdminId: c.assigned_admin?.id,
      assignedAdminName: c.assigned_admin?.name,
      createdAt: c.created_at.toISOString(),
      updatedAt: c.updated_at.toISOString(),
      resolvedAt: c.resolved_at?.toISOString(),
      messages: includeMessages
        ? (c.messages ?? []).map((m) => ({
            id: m.id,
            senderId: m.sender_id,
            senderRole: m.sender_role,
            message: m.message,
            createdAt: m.created_at.toISOString(),
            readAt: m.read_at?.toISOString(),
          }))
        : undefined,
      attachments: (c.attachments ?? []).map((a) => ({
        id: a.id,
        fileName: a.file_name,
        fileUrl: a.file_url,
        mimeType: a.mime_type,
        createdAt: a.created_at.toISOString(),
      })),
      notes: includeAdmin
        ? (c.notes ?? []).map((n) => ({
            id: n.id,
            note: n.note,
            adminName: n.admin.name,
            createdAt: n.created_at.toISOString(),
          }))
        : undefined,
      events: includeAdmin
        ? (c.events ?? []).map((e) => ({
            id: e.id,
            eventType: e.event_type,
            oldValue: e.old_value,
            newValue: e.new_value,
            createdAt: e.created_at.toISOString(),
          }))
        : undefined,
    };
  }
}
