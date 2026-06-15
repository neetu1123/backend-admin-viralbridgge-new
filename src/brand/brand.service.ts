import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginationMeta } from '../common/dto/pagination-query.dto';
import {
  BrandCampaignQueryDto,
  CampaignDto,
  CreatorDiscoveryQueryDto,
  FundsDto,
  NotificationQueryDto,
  SendMessageDto,
  TransactionQueryDto,
  UpdateBrandProfileDto,
} from './brand.dto';

@Injectable()
export class BrandService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private notifications: NotificationsService,
  ) {}

  async getProfile(userId: string) {
    return this.ensureBrandProfile(userId);
  }

  async updateProfile(userId: string, dto: UpdateBrandProfileDto) {
    const profile = await this.ensureBrandProfile(userId);
    return this.prisma.brandProfile.update({
      where: { id: profile.id },
      data: {
        company_name: dto.companyName,
        website: dto.website,
        industry: dto.industry,
        description: dto.description,
        logo: dto.logo,
        contact_email: dto.contactEmail,
        phone: dto.phone,
        location: dto.location,
      },
      include: { user: true },
    });
  }

  async createCampaign(userId: string, dto: CampaignDto) {
    const profile = await this.ensureBrandProfile(userId);
    return this.prisma.campaign.create({
      data: {
        brand_id: profile.id,
        title: dto.title,
        description: dto.description,
        platform: dto.platform,
        budget: dto.budget,
        remaining_budget: dto.budget,
        deadline: new Date(dto.deadline),
        deliverables: dto.deliverables ?? [],
        locality: dto.locality,
        languages: dto.languages ?? [],
        status: dto.status ?? 'PENDING_APPROVAL',
      },
    });
  }

  async getCampaigns(userId: string, query: BrandCampaignQueryDto) {
    const profile = await this.ensureBrandProfile(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { brand_id: profile.id };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.platform) where.platform = { equals: query.platform, mode: 'insensitive' };
    if (query.status) where.status = { equals: query.status, mode: 'insensitive' };
    if (query.locality) where.locality = { contains: query.locality, mode: 'insensitive' };
    if (query.language) where.languages = { has: query.language };

    const orderBy =
      query.sort === 'budget_desc'
        ? { budget: 'desc' as const }
        : query.sort === 'budget_asc'
          ? { budget: 'asc' as const }
          : query.sort === 'deadline_asc'
            ? { deadline: 'asc' as const }
            : { created_at: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: { applications: { include: { creator: { include: { user: true } } } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async getCampaign(userId: string, id: string) {
    return this.getOwnedCampaign(userId, id);
  }

  async getCampaignDetail(userId: string, id: string) {
    await this.getOwnedCampaign(userId, id);
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: true,
        applications: { include: { creator: { include: { user: true } }, deliverables: true } },
        campaignDeliverables: { include: { creator: { include: { user: true } }, application: true } },
        escrows: { include: { creator: { include: { user: true } } } },
      },
    });

    return {
      campaign,
      applicants: campaign?.applications ?? [],
      approvedCreators: campaign?.applications.filter((app) => app.status === 'ACCEPTED') ?? [],
      deliverables: campaign?.campaignDeliverables ?? [],
      payments: campaign?.escrows ?? [],
    };
  }

  async updateCampaign(userId: string, id: string, dto: CampaignDto) {
    await this.getOwnedCampaign(userId, id);
    return this.prisma.campaign.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        platform: dto.platform,
        budget: dto.budget,
        remaining_budget: dto.budget,
        deadline: new Date(dto.deadline),
        deliverables: dto.deliverables ?? [],
        locality: dto.locality,
        languages: dto.languages ?? [],
        status: dto.status,
      },
    });
  }

  async deleteCampaign(userId: string, id: string) {
    await this.getOwnedCampaign(userId, id);
    await this.prisma.campaign.delete({ where: { id } });
    return { success: true };
  }

  async getCampaignRecommendations(userId: string, campaignId: string) {
    return this.matchingService.getCampaignRecommendations(campaignId, userId);
  }

  async getApplicants(userId: string, campaignId: string) {
    await this.getOwnedCampaign(userId, campaignId);
    return this.prisma.application.findMany({
      where: { campaign_id: campaignId },
      include: { creator: { include: { user: true } }, campaign: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateApplication(userId: string, applicationId: string, status: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { campaign: true, creator: { include: { user: true } } },
    });
    if (!application) throw new NotFoundException('Application not found');
    await this.getOwnedCampaign(userId, application.campaign_id);

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: { creator: { include: { user: true } }, campaign: true },
    });

    if (status === 'ACCEPTED') {
      await this.ensureAcceptedApplicationResources(application);
    }

    await this.createNotification(
      application.creator.user_id,
      'Application updated',
      `Your application for ${application.campaign.title} is ${status.toLowerCase()}.`,
      { applicationId, campaignId: application.campaign_id, status },
    );

    return updated;
  }

  async inviteCreator(userId: string, campaignId: string, creatorId: string) {
    const campaign = await this.getOwnedCampaign(userId, campaignId);
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: { user: true },
    });
    if (!creator) throw new NotFoundException('Creator not found');

    await this.createNotification(
      creator.user_id,
      'Campaign invitation',
      `You were invited to apply for ${campaign.title}.`,
      { campaignId, creatorId },
    );

    return { success: true };
  }

  async getCreators(query: CreatorDiscoveryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = {};
    if (query.search) {
      where.OR = [
        { full_name: { contains: query.search, mode: 'insensitive' } },
        { niche: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.niche) where.niche = { contains: query.niche, mode: 'insensitive' };
    if (query.locality) where.locality = { contains: query.locality, mode: 'insensitive' };
    if (query.language) where.languages = { has: query.language };
    if (query.followersMin) where.followers = { gte: query.followersMin };
    if (query.engagementMin) where.engagement_rate = { gte: query.engagementMin };

    const orderBy =
      query.sort === 'followers'
        ? { followers: 'desc' as const }
        : query.sort === 'engagement'
          ? { engagement_rate: 'desc' as const }
          : { updated_at: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.creatorProfile.findMany({
        where,
        include: { user: true, applications: { include: { campaign: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.creatorProfile.count({ where }),
    ]);

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async getMyCreators(userId: string, query: CreatorDiscoveryQueryDto) {
    const profile = await this.ensureBrandProfile(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = {
      status: { in: ['ACCEPTED', 'COMPLETED'] },
      campaign: { brand_id: profile.id },
    };
    if (query.search) {
      where.OR = [
        { creator: { full_name: { contains: query.search, mode: 'insensitive' } } },
        { creator: { niche: { contains: query.search, mode: 'insensitive' } } },
        { creator: { user: { name: { contains: query.search, mode: 'insensitive' } } } },
        { campaign: { title: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          creator: { include: { user: true, applications: { include: { campaign: true } } } },
          campaign: true,
          deliverables: true,
        },
        orderBy: { updated_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data: applications, meta: paginationMeta(page, limit, total) };
  }

  async getCampaignDeliverables(userId: string, campaignId: string) {
    await this.getOwnedCampaign(userId, campaignId);
    return this.prisma.deliverable.findMany({
      where: { campaign_id: campaignId },
      include: { creator: { include: { user: true } }, application: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async reviewDeliverable(userId: string, deliverableId: string, status: string, notes?: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: { campaign: true, creator: { include: { user: true } } },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');
    await this.getOwnedCampaign(userId, deliverable.campaign_id);

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status,
        revision_notes: notes,
        reviewed_at: new Date(),
      },
    });

    await this.createNotification(
      deliverable.creator.user_id,
      'Deliverable reviewed',
      `Your deliverable for ${deliverable.campaign.title} was marked ${status.toLowerCase()}.`,
      { deliverableId, campaignId: deliverable.campaign_id, status },
    );

    return updated;
  }

  async releaseEscrow(userId: string, escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { brand: true, creator: true },
    });
    if (!escrow) throw new NotFoundException('Escrow not found');
    if (escrow.brand.user_id !== userId) throw new ForbiddenException('Forbidden');
    if (escrow.status === 'RELEASED') return escrow;

    return this.prisma.$transaction(async (tx) => {
      const creatorWallet = await tx.wallet.upsert({
        where: { user_id: escrow.creator.user_id },
        update: {},
        create: { user_id: escrow.creator.user_id },
      });
      await tx.wallet.update({
        where: { id: creatorWallet.id },
        data: { available_balance: { increment: escrow.amount } },
      });
      await tx.transaction.create({
        data: {
          wallet_id: creatorWallet.id,
          type: 'ESCROW_RELEASE',
          amount: escrow.amount,
          status: 'COMPLETED',
          reference_id: escrow.id,
        },
      });
      return tx.escrow.update({
        where: { id: escrow.id },
        data: { status: 'RELEASED' },
      });
    });
  }

  async getDashboard(userId: string) {
    const profile = await this.ensureBrandProfile(userId);
    const [totalCampaigns, activeCampaigns, pendingApprovals, budget, topCampaign] =
      await Promise.all([
        this.prisma.campaign.count({ where: { brand_id: profile.id } }),
        this.prisma.campaign.count({ where: { brand_id: profile.id, status: 'ACTIVE' } }),
        this.prisma.application.count({
          where: { campaign: { brand_id: profile.id }, status: 'PENDING' },
        }),
        this.prisma.campaign.aggregate({
          where: { brand_id: profile.id },
          _sum: { budget: true, remaining_budget: true },
        }),
        this.prisma.campaign.findFirst({
          where: { brand_id: profile.id },
          include: { _count: { select: { applications: true } } },
          orderBy: { applications: { _count: 'desc' } },
        }),
      ]);

    const totalBudget = budget._sum.budget ?? 0;
    const budgetRemaining = budget._sum.remaining_budget ?? 0;
    return {
      totalCampaigns,
      activeCampaigns,
      pendingApprovals,
      budgetUsed: totalBudget - budgetRemaining,
      budgetRemaining,
      topCampaign,
    };
  }

  async getWallet(userId: string) {
    return this.ensureWallet(userId);
  }

  async addFunds(userId: string, dto: FundsDto) {
    const wallet = await this.ensureWallet(userId);
    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { available_balance: { increment: dto.amount } },
      });
      const transaction = await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          type: 'DEPOSIT',
          amount: dto.amount,
          status: 'COMPLETED',
        },
      });
      return { wallet: updatedWallet, transaction };
    });
  }

  async getWalletTransactions(userId: string, query: TransactionQueryDto) {
    const wallet = await this.ensureWallet(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { wallet_id: wallet.id };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async getAnalytics(userId: string) {
    const profile = await this.ensureBrandProfile(userId);
    const [campaigns, applications, spend] = await Promise.all([
      this.prisma.campaign.count({ where: { brand_id: profile.id } }),
      this.prisma.application.count({ where: { campaign: { brand_id: profile.id } } }),
      this.prisma.transaction.aggregate({
        where: { wallet: { user_id: userId }, type: { in: ['ESCROW_HOLD', 'DEPOSIT'] } },
        _sum: { amount: true },
      }),
    ]);
    return { campaigns, applications, spend: spend._sum.amount ?? 0 };
  }

  async getRoi(userId: string) {
    const analytics = await this.getAnalytics(userId);
    const roi = analytics.spend > 0 ? analytics.applications / analytics.spend : 0;
    return { ...analytics, roi };
  }

  async getTopCreators(userId: string) {
    const profile = await this.ensureBrandProfile(userId);
    return this.prisma.application.findMany({
      where: { campaign: { brand_id: profile.id }, status: { in: ['ACCEPTED', 'COMPLETED'] } },
      include: { creator: { include: { user: true } } },
      orderBy: { proposed_price: 'desc' },
      take: 10,
    });
  }

  async getConversations(userId: string) {
    const profile = await this.ensureBrandProfile(userId);
    return this.prisma.conversation.findMany({
      where: { brand_id: profile.id },
      include: {
        creator: { include: { user: true } },
        messages: { orderBy: { created_at: 'desc' }, take: 1 },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async getMessages(userId: string, conversationId: string) {
    await this.getOwnedConversation(userId, conversationId);
    return this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      include: { sender: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    await this.getOwnedConversation(userId, dto.conversationId);
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversation_id: dto.conversationId,
          sender_id: userId,
          message: dto.message,
          type: dto.type ?? 'text',
          file_url: dto.fileUrl,
          file_name: dto.fileName,
          file_size: dto.fileSize,
        },
      });
      await tx.conversation.update({
        where: { id: dto.conversationId },
        data: { updated_at: new Date() },
      });
      return message;
    });
  }

  async getNotifications(userId: string, query: NotificationQueryDto) {
    return this.notifications.list(userId, {
      page: query.page,
      limit: query.limit,
      unread: query.isRead === false ? true : undefined,
    });
  }

  async markNotificationRead(userId: string, id: string) {
    const result = await this.notifications.markRead(userId, id);
    if (!result) throw new NotFoundException('Notification not found');
    return result;
  }

  async getUnreadNotificationCount(userId: string) {
    return this.notifications.unreadCount(userId);
  }

  async markAllNotificationsRead(userId: string) {
    return this.notifications.markAllRead(userId);
  }

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.settings ?? {};
  }

  async updateSettings(userId: string, settings: Record<string, any>) {
    return this.prisma.user.update({ where: { id: userId }, data: { settings } });
  }

  private async ensureBrandProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.brandProfile.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId, company_name: user.name },
      include: { user: true },
    });
  }

  private async ensureWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });
  }

  private async getOwnedCampaign(userId: string, id: string) {
    const profile = await this.ensureBrandProfile(userId);
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { brand: true, applications: { include: { creator: { include: { user: true } } } } },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.brand_id !== profile.id) throw new ForbiddenException('Forbidden');
    return campaign;
  }

  private async getOwnedConversation(userId: string, conversationId: string) {
    const profile = await this.ensureBrandProfile(userId);
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.brand_id !== profile.id) throw new ForbiddenException('Forbidden');
    return conversation;
  }

  private async ensureAcceptedApplicationResources(application: any) {
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        brand_id: application.campaign.brand_id,
        creator_id: application.creator_id,
      },
    });

    if (!existingConversation) {
      await this.prisma.conversation.create({
        data: {
          brand_id: application.campaign.brand_id,
          creator_id: application.creator_id,
        },
      });
    }

    const amount = application.proposed_price ?? application.campaign.budget;
    const existingEscrow = await this.prisma.escrow.findFirst({
      where: {
        campaign_id: application.campaign_id,
        creator_id: application.creator_id,
      },
    });

    if (!existingEscrow && amount > 0) {
      await this.prisma.escrow.create({
        data: {
          campaign_id: application.campaign_id,
          brand_id: application.campaign.brand_id,
          creator_id: application.creator_id,
          amount,
          status: 'HELD',
        },
      });
    }

    const existingDeliverables = await this.prisma.deliverable.count({
      where: { application_id: application.id },
    });

    if (existingDeliverables === 0) {
      const titles = application.campaign.deliverables?.length
        ? application.campaign.deliverables
        : ['Campaign content'];

      await this.prisma.deliverable.createMany({
        data: titles.map((title: string) => ({
          campaign_id: application.campaign_id,
          application_id: application.id,
          creator_id: application.creator_id,
          title,
          type: title,
          status: 'PENDING',
        })),
      });
    }
  }

  private async createNotification(
    userId: string,
    title: string,
    body: string,
    metadata?: Record<string, any>,
  ) {
    return this.prisma.notification.create({
      data: { user_id: userId, title, body, type: 'SYSTEM', metadata: metadata ?? {} },
    });
  }
}
