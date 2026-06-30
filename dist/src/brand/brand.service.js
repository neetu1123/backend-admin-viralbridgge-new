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
exports.BrandService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const matching_service_1 = require("../matching/matching.service");
const notifications_service_1 = require("../notifications/notifications.service");
const wallet_service_1 = require("../payments/wallet.service");
const escrow_service_1 = require("../payments/escrow.service");
const deliverables_service_1 = require("../payments/deliverables.service");
const razorpay_service_1 = require("../payments/razorpay.service");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
let BrandService = class BrandService {
    prisma;
    matchingService;
    notifications;
    walletService;
    escrowService;
    deliverablesService;
    razorpayService;
    constructor(prisma, matchingService, notifications, walletService, escrowService, deliverablesService, razorpayService) {
        this.prisma = prisma;
        this.matchingService = matchingService;
        this.notifications = notifications;
        this.walletService = walletService;
        this.escrowService = escrowService;
        this.deliverablesService = deliverablesService;
        this.razorpayService = razorpayService;
    }
    async getProfile(userId) {
        return this.ensureBrandProfile(userId);
    }
    async updateProfile(userId, dto) {
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
    async createCampaign(userId, dto) {
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
    async getCampaigns(userId, query) {
        const profile = await this.ensureBrandProfile(userId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { brand_id: profile.id };
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.platform)
            where.platform = { equals: query.platform, mode: 'insensitive' };
        if (query.status)
            where.status = { equals: query.status, mode: 'insensitive' };
        if (query.locality)
            where.locality = { contains: query.locality, mode: 'insensitive' };
        if (query.language)
            where.languages = { has: query.language };
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
                include: { applications: { include: { creator: { include: { user: true } } } } },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.campaign.count({ where }),
        ]);
        return { data, meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async getCampaign(userId, id) {
        return this.getOwnedCampaign(userId, id);
    }
    async getCampaignDetail(userId, id) {
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
    async updateCampaign(userId, id, dto) {
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
    async deleteCampaign(userId, id) {
        await this.getOwnedCampaign(userId, id);
        await this.prisma.campaign.delete({ where: { id } });
        return { success: true };
    }
    async getCampaignRecommendations(userId, campaignId) {
        return this.matchingService.getCampaignRecommendations(campaignId, userId);
    }
    async getApplicants(userId, campaignId) {
        await this.getOwnedCampaign(userId, campaignId);
        return this.prisma.application.findMany({
            where: { campaign_id: campaignId },
            include: { creator: { include: { user: true } }, campaign: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async updateApplication(userId, applicationId, status) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                campaign: { include: { brand: { include: { user: true } } } },
                creator: { include: { user: true } },
            },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        await this.getOwnedCampaign(userId, application.campaign_id);
        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: { status },
            include: { creator: { include: { user: true } }, campaign: true },
        });
        if (status === 'ACCEPTED') {
            await this.ensureAcceptedApplicationResources(application);
        }
        await this.createNotification(application.creator.user_id, 'Application updated', `Your application for ${application.campaign.title} is ${status.toLowerCase()}.`, { applicationId, campaignId: application.campaign_id, status });
        return updated;
    }
    async inviteCreator(userId, campaignId, creatorId) {
        const campaign = await this.getOwnedCampaign(userId, campaignId);
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            include: { user: true },
        });
        if (!creator)
            throw new common_1.NotFoundException('Creator not found');
        await this.createNotification(creator.user_id, 'Campaign invitation', `You were invited to apply for ${campaign.title}.`, { campaignId, creatorId });
        return { success: true };
    }
    async getCreators(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {};
        if (query.search) {
            where.OR = [
                { full_name: { contains: query.search, mode: 'insensitive' } },
                { niche: { contains: query.search, mode: 'insensitive' } },
                { user: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        if (query.niche)
            where.niche = { contains: query.niche, mode: 'insensitive' };
        if (query.locality)
            where.locality = { contains: query.locality, mode: 'insensitive' };
        if (query.language)
            where.languages = { has: query.language };
        if (query.followersMin)
            where.followers = { gte: query.followersMin };
        if (query.engagementMin)
            where.engagement_rate = { gte: query.engagementMin };
        const orderBy = query.sort === 'followers'
            ? { followers: 'desc' }
            : query.sort === 'engagement'
                ? { engagement_rate: 'desc' }
                : { updated_at: 'desc' };
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
        return { data, meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async getMyCreators(userId, query) {
        const profile = await this.ensureBrandProfile(userId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
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
        return { data: applications, meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async getCampaignDeliverables(userId, campaignId) {
        await this.getOwnedCampaign(userId, campaignId);
        return this.prisma.deliverable.findMany({
            where: { campaign_id: campaignId },
            include: { creator: { include: { user: true } }, application: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async reviewDeliverable(userId, deliverableId, status, notes) {
        if (status === 'APPROVED') {
            return this.deliverablesService.approve(userId, deliverableId);
        }
        if (status === 'REVISION_REQUESTED') {
            return this.deliverablesService.requestRevision(userId, deliverableId, { notes });
        }
        if (status === 'REJECTED') {
            return this.deliverablesService.reject(userId, deliverableId, { notes });
        }
        return this.deliverablesService.requestRevision(userId, deliverableId, { notes });
    }
    async releaseEscrow(userId, escrowId) {
        return this.escrowService.releaseEscrow(userId, escrowId);
    }
    async fundEscrow(userId, body) {
        return this.escrowService.createEscrow(userId, body);
    }
    async listEscrows(userId) {
        return this.escrowService.listEscrows(userId, 'brand');
    }
    async getDashboard(userId) {
        const profile = await this.ensureBrandProfile(userId);
        const [totalCampaigns, activeCampaigns, pendingApprovals, budget, topCampaign] = await Promise.all([
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
    async getWallet(userId) {
        return this.walletService.getWallet(userId);
    }
    async addFunds(userId, dto) {
        return this.walletService.addFunds(userId, dto);
    }
    async createPaymentOrder(userId, amount) {
        return this.razorpayService.createOrder(userId, amount);
    }
    async verifyPayment(userId, dto) {
        return this.walletService.verifyAndCredit(userId, dto);
    }
    getRazorpayKey() {
        return { keyId: this.razorpayService.getPublicKey() };
    }
    async getWalletTransactions(userId, query) {
        return this.walletService.getTransactions(userId, query);
    }
    async getAnalytics(userId) {
        const profile = await this.ensureBrandProfile(userId);
        const [campaigns, applications, spend] = await Promise.all([
            this.prisma.campaign.count({ where: { brand_id: profile.id } }),
            this.prisma.application.count({ where: { campaign: { brand_id: profile.id } } }),
            this.prisma.walletTransaction.aggregate({
                where: { wallet: { user_id: userId }, type: { in: ['ESCROW_HOLD', 'DEPOSIT'] } },
                _sum: { amount: true },
            }),
        ]);
        return { campaigns, applications, spend: spend._sum.amount ?? 0 };
    }
    async getRoi(userId) {
        const analytics = await this.getAnalytics(userId);
        const roi = analytics.spend > 0 ? analytics.applications / analytics.spend : 0;
        return { ...analytics, roi };
    }
    async getTopCreators(userId) {
        const profile = await this.ensureBrandProfile(userId);
        return this.prisma.application.findMany({
            where: { campaign: { brand_id: profile.id }, status: { in: ['ACCEPTED', 'COMPLETED'] } },
            include: { creator: { include: { user: true } } },
            orderBy: { proposed_price: 'desc' },
            take: 10,
        });
    }
    async getConversations(userId) {
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
    async ensureBrandProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.brandProfile.upsert({
            where: { user_id: userId },
            update: {},
            create: { user_id: userId, company_name: user.name },
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
    async getOwnedCampaign(userId, id) {
        const profile = await this.ensureBrandProfile(userId);
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: { brand: true, applications: { include: { creator: { include: { user: true } } } } },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.brand_id !== profile.id)
            throw new common_1.ForbiddenException('Forbidden');
        return campaign;
    }
    async getOwnedConversation(userId, conversationId) {
        const profile = await this.ensureBrandProfile(userId);
        const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        if (conversation.brand_id !== profile.id)
            throw new common_1.ForbiddenException('Forbidden');
        return conversation;
    }
    async ensureAcceptedApplicationResources(application) {
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
        if (amount > 0) {
            await this.escrowService.createPendingEscrowOnApplicationAccept(application);
        }
        const existingDeliverables = await this.prisma.deliverable.count({
            where: { application_id: application.id },
        });
        if (existingDeliverables === 0) {
            const titles = application.campaign.deliverables?.length
                ? application.campaign.deliverables
                : ['Campaign content'];
            await this.prisma.deliverable.createMany({
                data: titles.map((title) => ({
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
    async createNotification(userId, title, body, metadata) {
        return this.prisma.notification.create({
            data: { user_id: userId, title, body, type: 'SYSTEM', metadata: metadata ?? {} },
        });
    }
};
exports.BrandService = BrandService;
exports.BrandService = BrandService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        matching_service_1.MatchingService,
        notifications_service_1.NotificationsService,
        wallet_service_1.WalletService,
        escrow_service_1.EscrowService,
        deliverables_service_1.DeliverablesService,
        razorpay_service_1.RazorpayService])
], BrandService);
//# sourceMappingURL=brand.service.js.map