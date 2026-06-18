"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const matching_service_1 = require("../matching/matching.service");
const notifications_service_1 = require("../notifications/notifications.service");
const withdrawal_service_1 = require("../payments/withdrawal.service");
const wallet_service_1 = require("../payments/wallet.service");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
let CreatorService = class CreatorService {
    prisma;
    matchingService;
    notifications;
    walletService;
    withdrawalService;
    constructor(prisma, matchingService, notifications, walletService, withdrawalService) {
        this.prisma = prisma;
        this.matchingService = matchingService;
        this.notifications = notifications;
        this.walletService = walletService;
        this.withdrawalService = withdrawalService;
    }
    async getProfile(userId) {
        return this.ensureCreatorProfile(userId);
    }
    async updateProfile(userId, dto) {
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
    async uploadPhoto(userId, dto) {
        const profile = await this.ensureCreatorProfile(userId);
        return this.prisma.creatorProfile.update({
            where: { id: profile.id },
            data: { photo: dto.url },
        });
    }
    async uploadMediaKit(userId, dto) {
        const profile = await this.ensureCreatorProfile(userId);
        return this.prisma.creatorProfile.update({
            where: { id: profile.id },
            data: { media_kit: dto.url },
        });
    }
    async getCampaigns(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const includeMatch = query.includeMatch === true || query.includeMatch === 'true';
        const where = { status: { in: ['ACTIVE', 'PENDING_APPROVAL'] } };
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { brand: { company_name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        if (query.platform)
            where.platform = { equals: query.platform, mode: 'insensitive' };
        if (query.locality)
            where.locality = { contains: query.locality, mode: 'insensitive' };
        if (query.language)
            where.languages = { has: query.language };
        if (query.budgetMin || query.budgetMax) {
            where.budget = {};
            if (query.budgetMin)
                where.budget.gte = query.budgetMin;
            if (query.budgetMax)
                where.budget.lte = query.budgetMax;
        }
        const orderBy = query.sort === 'budget_desc'
            ? { budget: 'desc' }
            : query.sort === 'budget_asc'
                ? { budget: 'asc' }
                : query.sort === 'deadline_asc'
                    ? { deadline: 'asc' }
                    : { created_at: 'desc' };
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
                const scoreMap = await this.matchingService.getCreatorCampaignMatchScores(profile.id, data.map((c) => c.id));
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
            meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total),
            aiMatchingEnabled: aiEnabled,
        };
    }
    async getCampaign(id) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: { brand: { include: { user: true } }, applications: true },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async apply(userId, campaignId, dto) {
        const profile = await this.ensureCreatorProfile(userId);
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { brand: { include: { user: true } } },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
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
        await this.createNotification(campaign.brand.user_id, 'New campaign application', `${profile.full_name ?? profile.user.name} applied to ${campaign.title}.`, { campaignId, applicationId: application.id });
        return application;
    }
    async getApplications(userId, query) {
        const profile = await this.ensureCreatorProfile(userId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { creator_id: profile.id };
        if (query.status)
            where.status = { equals: query.status, mode: 'insensitive' };
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
        return { data, meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async getApplication(userId, id) {
        const profile = await this.ensureCreatorProfile(userId);
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: { campaign: { include: { brand: true } } },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        if (application.creator_id !== profile.id)
            throw new common_1.ForbiddenException('Forbidden');
        return application;
    }
    async getDashboard(userId) {
        const profile = await this.ensureCreatorProfile(userId);
        const [totalApplications, acceptedApplications, pendingApplications, wallet, earnings] = await Promise.all([
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
    async getDeliverables(userId) {
        const profile = await this.ensureCreatorProfile(userId);
        return this.prisma.deliverable.findMany({
            where: { creator_id: profile.id },
            include: { campaign: { include: { brand: true } }, application: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async submitDeliverable(userId, deliverableId, dto) {
        const profile = await this.ensureCreatorProfile(userId);
        const deliverable = await this.prisma.deliverable.findUnique({
            where: { id: deliverableId },
            include: { campaign: { include: { brand: true } } },
        });
        if (!deliverable)
            throw new common_1.NotFoundException('Deliverable not found');
        if (deliverable.creator_id !== profile.id)
            throw new common_1.ForbiddenException('Forbidden');
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
        await this.createNotification(deliverable.campaign.brand.user_id, 'Deliverable submitted', `${profile.full_name ?? profile.user.name} submitted a deliverable for ${deliverable.campaign.title}.`, { deliverableId, campaignId: deliverable.campaign_id });
        return updated;
    }
    async getWallet(userId) {
        return this.walletService.getWallet(userId);
    }
    async withdraw(userId, dto) {
        return this.withdrawalService.requestWithdrawal(userId, dto);
    }
    async getWalletTransactions(userId, query) {
        return this.walletService.getTransactions(userId, query);
    }
    async getConversations(userId) {
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
    async getMessages(userId, conversationId) {
        await this.getOwnedConversation(userId, conversationId);
        return this.prisma.message.findMany({
            where: { conversation_id: conversationId },
            include: { sender: true },
            orderBy: { created_at: 'asc' },
        });
    }
    async sendMessage(userId, dto) {
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
    async getNotifications(userId, query) {
        return this.notifications.list(userId, {
            page: query.page,
            limit: query.limit,
            unread: query.isRead === false ? true : undefined,
        });
    }
    async markNotificationRead(userId, id) {
        const result = await this.notifications.markRead(userId, id);
        if (!result)
            throw new common_1.NotFoundException('Notification not found');
        return result;
    }
    async getUnreadNotificationCount(userId) {
        return this.notifications.unreadCount(userId);
    }
    async markAllNotificationsRead(userId) {
        return this.notifications.markAllRead(userId);
    }
    async getSettings(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        return user?.settings ?? {};
    }
    async updateSettings(userId, settings) {
        return this.prisma.user.update({ where: { id: userId }, data: { settings } });
    }
    async ensureCreatorProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.creatorProfile.upsert({
            where: { user_id: userId },
            update: {},
            create: { user_id: userId, full_name: user.name, languages: [] },
            include: { user: true },
        });
    }
    async ensureWallet(userId) {
        return this.prisma.wallet.upsert({
            where: { user_id: userId },
            update: {},
            create: { user_id: userId },
        });
    }
    async getOwnedConversation(userId, conversationId) {
        const profile = await this.ensureCreatorProfile(userId);
        const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        if (conversation.creator_id !== profile.id)
            throw new common_1.ForbiddenException('Forbidden');
        return conversation;
    }
    async createNotification(userId, title, body, metadata) {
        return this.prisma.notification.create({
            data: { user_id: userId, title, body, type: 'SYSTEM', metadata: metadata ?? {} },
        });
    }
};
exports.CreatorService = CreatorService;
exports.CreatorService = CreatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        matching_service_1.MatchingService,
        notifications_service_1.NotificationsService,
        wallet_service_1.WalletService,
        withdrawal_service_1.WithdrawalService])
], CreatorService);
//# sourceMappingURL=creator.service.js.map