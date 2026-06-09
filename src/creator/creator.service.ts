import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { paginationMeta } from '../common/dto/pagination-query.dto';
import {
  ApplyCampaignDto,
  ApplicationQueryDto,
  CreatorCampaignQueryDto,
  NotificationQueryDto,
  SendMessageDto,
  SubmitDeliverableDto,
  TransactionQueryDto,
  UpdateCreatorProfileDto,
  UploadDto,
  WithdrawDto,
} from './creator.dto';

@Injectable()
export class CreatorService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
  ) {}

  async getProfile(userId: string) {
    return this.ensureCreatorProfile(userId);
  }

  async updateProfile(userId: string, dto: UpdateCreatorProfileDto) {
    const profile = await this.ensureCreatorProfile(userId);
    return this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        full_name: dto.fullName,
        bio: dto.bio,
        niche: dto.niche,
        followers: dto.followers,
        engagement_rate: dto.engagementRate,
        languages: dto.languages,
        locality: dto.locality,
        social_links: {
          instagram: dto.instagram,
          youtube: dto.youtube,
          tiktok: dto.tiktok,
        },
        media_kit: dto.mediaKit,
        portfolio: dto.portfolio,
        contact_email: dto.contactEmail,
        phone: dto.phone,
      },
      include: { user: true },
    });
  }

  async uploadPhoto(userId: string, dto: UploadDto) {
    const profile = await this.ensureCreatorProfile(userId);
    return this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: { photo: dto.url },
    });
  }

  async uploadMediaKit(userId: string, dto: UploadDto) {
    const profile = await this.ensureCreatorProfile(userId);
    return this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: { media_kit: dto.url },
    });
  }

  async getCampaigns(userId: string | undefined, query: CreatorCampaignQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const includeMatch = query.includeMatch === true || query.includeMatch === 'true';
    const where: any = { status: { in: ['ACTIVE', 'PENDING_APPROVAL'] } };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { brand: { company_name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.platform) where.platform = { equals: query.platform, mode: 'insensitive' };
    if (query.locality) where.locality = { contains: query.locality, mode: 'insensitive' };
    if (query.language) where.languages = { has: query.language };
    if (query.budgetMin || query.budgetMax) {
      where.budget = {};
      if (query.budgetMin) where.budget.gte = query.budgetMin;
      if (query.budgetMax) where.budget.lte = query.budgetMax;
    }

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
        include: { brand: { include: { user: true } }, _count: { select: { applications: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    const aiEnabled = includeMatch ? await this.matchingService.isAiMatchingEnabled() : false;
    let enriched = data;

    if (aiEnabled && userId) {
      const profile = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
      if (profile) {
        const scoreMap = await this.matchingService.getCreatorCampaignMatchScores(
          profile.id,
          data.map((c) => c.id),
        );
        enriched = data.map((campaign) => {
          const match = scoreMap.get(campaign.id);
          return match
            ? { ...campaign, matchScore: match.matchScore, matchReasons: match.reasons }
            : campaign;
        });
      }
    }

    return {
      data: enriched,
      meta: paginationMeta(page, limit, total),
      aiMatchingEnabled: aiEnabled,
    };
  }

  async getCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { brand: { include: { user: true } }, applications: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async apply(userId: string, campaignId: string, dto: ApplyCampaignDto) {
    const profile = await this.ensureCreatorProfile(userId);
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: { include: { user: true } } },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const existing = await this.prisma.application.findFirst({
      where: { creator_id: profile.id, campaign_id: campaignId },
    });

    const application = existing
      ? await this.prisma.application.update({
          where: { id: existing.id },
          data: {
            message: dto.message,
            proposed_price: dto.proposedPrice,
            status: 'PENDING',
          },
          include: { campaign: true, creator: { include: { user: true } } },
        })
      : await this.prisma.application.create({
          data: {
            creator_id: profile.id,
            campaign_id: campaignId,
            message: dto.message,
            proposed_price: dto.proposedPrice,
          },
          include: { campaign: true, creator: { include: { user: true } } },
        });

    await this.createNotification(
      campaign.brand.user_id,
      'New campaign application',
      `${profile.full_name ?? profile.user.name} applied to ${campaign.title}.`,
      { campaignId, applicationId: application.id },
    );

    return application;
  }

  async getApplications(userId: string, query: ApplicationQueryDto) {
    const profile = await this.ensureCreatorProfile(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { creator_id: profile.id };
    if (query.status) where.status = { equals: query.status, mode: 'insensitive' };
    if (query.search) {
      where.campaign = {
        title: { contains: query.search, mode: 'insensitive' },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: { campaign: { include: { brand: true } } },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async getApplication(userId: string, id: string) {
    const profile = await this.ensureCreatorProfile(userId);
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { campaign: { include: { brand: true } } },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.creator_id !== profile.id) throw new ForbiddenException('Forbidden');
    return application;
  }

  async getDashboard(userId: string) {
    const profile = await this.ensureCreatorProfile(userId);
    const [totalApplications, acceptedApplications, pendingApplications, wallet, earnings] =
      await Promise.all([
        this.prisma.application.count({ where: { creator_id: profile.id } }),
        this.prisma.application.count({ where: { creator_id: profile.id, status: 'ACCEPTED' } }),
        this.prisma.application.count({ where: { creator_id: profile.id, status: 'PENDING' } }),
        this.ensureWallet(userId),
        this.prisma.transaction.aggregate({
          where: { wallet: { user_id: userId }, type: 'ESCROW_RELEASE', status: 'COMPLETED' },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalApplications,
      acceptedApplications,
      pendingApplications,
      walletBalance: wallet.available_balance,
      earnings: earnings._sum.amount ?? 0,
    };
  }

  async getDeliverables(userId: string) {
    const profile = await this.ensureCreatorProfile(userId);
    return this.prisma.deliverable.findMany({
      where: { creator_id: profile.id },
      include: { campaign: { include: { brand: true } }, application: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async submitDeliverable(userId: string, deliverableId: string, dto: SubmitDeliverableDto) {
    const profile = await this.ensureCreatorProfile(userId);
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: { campaign: { include: { brand: true } } },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');
    if (deliverable.creator_id !== profile.id) throw new ForbiddenException('Forbidden');

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        media_url: dto.mediaUrl,
        thumbnail_url: dto.thumbnailUrl,
        notes: dto.notes,
        status: 'IN_REVIEW',
        submitted_at: new Date(),
      },
    });

    await this.createNotification(
      deliverable.campaign.brand.user_id,
      'Deliverable submitted',
      `${profile.full_name ?? profile.user.name} submitted a deliverable for ${deliverable.campaign.title}.`,
      { deliverableId, campaignId: deliverable.campaign_id },
    );

    return updated;
  }

  async getWallet(userId: string) {
    return this.ensureWallet(userId);
  }

  async withdraw(userId: string, dto: WithdrawDto) {
    const wallet = await this.ensureWallet(userId);
    if (wallet.available_balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { available_balance: { decrement: dto.amount } },
      });
      const transaction = await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          type: 'WITHDRAWAL',
          amount: dto.amount,
          status: 'PENDING',
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

  async getConversations(userId: string) {
    const profile = await this.ensureCreatorProfile(userId);
    return this.prisma.conversation.findMany({
      where: { creator_id: profile.id },
      include: {
        brand: { include: { user: true } },
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
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { user_id: userId };
    if (query.isRead !== undefined) where.is_read = query.isRead;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async markNotificationRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.user_id !== userId) throw new ForbiddenException('Forbidden');
    return this.prisma.notification.update({ where: { id }, data: { is_read: true } });
  }

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.settings ?? {};
  }

  async updateSettings(userId: string, settings: Record<string, any>) {
    return this.prisma.user.update({ where: { id: userId }, data: { settings } });
  }

  private async ensureCreatorProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.creatorProfile.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId, full_name: user.name, languages: [] },
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

  private async getOwnedConversation(userId: string, conversationId: string) {
    const profile = await this.ensureCreatorProfile(userId);
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.creator_id !== profile.id) throw new ForbiddenException('Forbidden');
    return conversation;
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
