import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WithdrawalService } from '../payments/withdrawal.service';
import { WalletService } from '../payments/wallet.service';
import { EscrowService } from '../payments/escrow.service';
import { DeliverablesService } from '../payments/deliverables.service';
import { StorageService, type UploadedFilePayload } from '../storage/storage.service';
import { UserActivityService } from '../user-activity/user-activity.service';
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
    private notifications: NotificationsService,
    private walletService: WalletService,
    private withdrawalService: WithdrawalService,
    private deliverablesService: DeliverablesService,
    private escrowService: EscrowService,
    private storageService: StorageService,
    private userActivity: UserActivityService,
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

  async uploadPhotoFile(userId: string, file: UploadedFilePayload) {
    const upload = await this.storageService.uploadProfileImage({ userId, file });
    const profile = await this.ensureCreatorProfile(userId);
    return this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: { photo: upload.url },
      include: { user: true },
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

    await this.userActivity.recordCampaignActivity(userId).catch(() => undefined);

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
        this.prisma.walletTransaction.aggregate({
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
    const rows = await this.prisma.deliverable.findMany({
      where: { creator_id: profile.id },
      include: { campaign: { include: { brand: true } }, application: true },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((d) => this.deliverablesService.formatDeliverable(d));
  }

  async listEscrows(userId: string) {
    return this.escrowService.listEscrows(userId, 'creator');
  }

  async uploadDeliverableMedia(
    userId: string,
    file: UploadedFilePayload,
    options?: { campaignId?: string; thumbnail?: UploadedFilePayload },
  ) {
    return this.deliverablesService.uploadMedia(userId, file, options);
  }

  async submitDeliverableWithFile(
    userId: string,
    deliverableId: string,
    file: UploadedFilePayload,
    notes?: string,
    thumbnail?: UploadedFilePayload,
  ) {
    return this.deliverablesService.submitWithUpload(userId, deliverableId, file, notes, thumbnail);
  }

  async submitDeliverable(userId: string, deliverableId: string, dto: SubmitDeliverableDto) {
    return this.deliverablesService.submit(userId, {
      deliverable_id: deliverableId,
      file_url: dto.mediaUrl ?? (dto as { file_url?: string }).file_url ?? '',
      mediaUrl: dto.mediaUrl,
      thumbnailUrl: dto.thumbnailUrl,
      notes: dto.notes,
    });
  }

  async getWallet(userId: string) {
    return this.walletService.getWallet(userId);
  }

  async withdraw(userId: string, dto: WithdrawDto) {
    return this.withdrawalService.requestWithdrawal(userId, dto);
  }

  async sendWithdrawOtp(userId: string) {
    return this.withdrawalService.sendWithdrawOtp(userId);
  }

  async getWalletTransactions(userId: string, query: TransactionQueryDto) {
    return this.walletService.getTransactions(userId, query);
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
      await this.userActivity.recordMessageActivity(userId).catch(() => undefined);
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const existing = (user?.settings as Record<string, unknown>) ?? {};
    return this.prisma.user.update({
      where: { id: userId },
      data: { settings: { ...existing, ...settings } },
    });
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
