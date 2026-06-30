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
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const wallet_event_emitter_1 = require("../common/wallet-event-emitter");
const constants_1 = require("./constants");
const wallet_service_1 = require("./wallet.service");
const platform_wallet_service_1 = require("./platform-wallet.service");
let EscrowService = class EscrowService {
    prisma;
    wallet;
    platformWallet;
    notifications;
    constructor(prisma, wallet, platformWallet, notifications) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.platformWallet = platformWallet;
        this.notifications = notifications;
    }
    calculatePlatformFee(amount) {
        return Math.round((amount * constants_1.PLATFORM_FEE_PERCENT) / 100 * 100) / 100;
    }
    async getEscrow(userId, escrowId) {
        const escrow = await this.prisma.escrow.findUnique({
            where: { id: escrowId },
            include: {
                campaign: { select: { id: true, title: true } },
                brand: { include: { user: { select: { id: true, name: true } } } },
                creator: { include: { user: { select: { id: true, name: true } } } },
            },
        });
        if (!escrow)
            throw new common_1.NotFoundException('Escrow not found');
        this.assertEscrowAccess(userId, escrow);
        return this.formatEscrow(escrow);
    }
    async getEscrowForCampaignCreator(campaignId, creatorId) {
        return this.prisma.escrow.findFirst({
            where: { campaign_id: campaignId, creator_id: creatorId },
            include: {
                campaign: { select: { title: true } },
                brand: { include: { user: true } },
                creator: { include: { user: true } },
            },
        });
    }
    async listEscrows(userId, role) {
        let escrows;
        if (role === 'brand') {
            const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
            if (!brand)
                return [];
            escrows = await this.prisma.escrow.findMany({
                where: { brand_id: brand.id },
                include: {
                    campaign: { select: { title: true } },
                    creator: { include: { user: { select: { name: true } } } },
                },
                orderBy: { created_at: 'desc' },
            });
        }
        else {
            const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
            if (!creator)
                return [];
            escrows = await this.prisma.escrow.findMany({
                where: { creator_id: creator.id },
                include: {
                    campaign: { select: { title: true } },
                    brand: { include: { user: { select: { name: true } } } },
                },
                orderBy: { created_at: 'desc' },
            });
        }
        return Promise.all(escrows.map(async (e) => {
            const openDispute = await this.prisma.dispute.findFirst({
                where: {
                    campaign_id: e.campaign_id,
                    creator_id: e.creator_id,
                    status: { in: constants_1.OPEN_DISPUTE_STATUSES },
                },
            });
            return {
                ...this.formatEscrow(e),
                hasOpenDispute: Boolean(openDispute),
                canDispute: e.status === constants_1.ESCROW_STATUSES.HELD && !openDispute,
            };
        }));
    }
    async listAdminEscrows(status) {
        const where = status ? { status: status.toUpperCase() } : {};
        const escrows = await this.prisma.escrow.findMany({
            where,
            include: {
                campaign: { select: { id: true, title: true } },
                brand: { include: { user: { select: { id: true, name: true, email: true } } } },
                creator: { include: { user: { select: { id: true, name: true, email: true } } } },
            },
            orderBy: { created_at: 'desc' },
        });
        return escrows.map((e) => this.formatEscrow(e));
    }
    async createEscrow(userId, dto) {
        const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
        if (!brand)
            throw new common_1.ForbiddenException('Brand profile required');
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: dto.campaign_id, brand_id: brand.id },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const creator = await this.prisma.creatorProfile.findUnique({ where: { id: dto.creator_id } });
        if (!creator)
            throw new common_1.NotFoundException('Creator not found');
        const amount = dto.amount ?? campaign.budget;
        if (amount <= 0)
            throw new common_1.BadRequestException('Escrow amount must be greater than zero');
        const existing = await this.prisma.escrow.findFirst({
            where: { campaign_id: dto.campaign_id, creator_id: dto.creator_id },
        });
        if (existing?.status === constants_1.ESCROW_STATUSES.HELD) {
            throw new common_1.BadRequestException('Escrow is already funded and held');
        }
        if (existing?.status === constants_1.ESCROW_STATUSES.RELEASED) {
            throw new common_1.BadRequestException('Escrow has already been released');
        }
        if (existing?.status === constants_1.ESCROW_STATUSES.PENDING) {
            return this.fundPendingEscrow(existing.id, {
                brandUserId: userId,
                creatorUserId: creator.user_id,
                amount,
                campaignTitle: campaign.title,
            });
        }
        return this.lockFundsForEscrow({
            campaignId: dto.campaign_id,
            brandId: brand.id,
            brandUserId: userId,
            creatorId: dto.creator_id,
            creatorUserId: creator.user_id,
            amount,
            campaignTitle: campaign.title,
        });
    }
    async createPendingEscrowOnApplicationAccept(application) {
        const amount = application.proposed_price ?? application.campaign.budget;
        if (amount <= 0)
            return null;
        const existing = await this.prisma.escrow.findFirst({
            where: { campaign_id: application.campaign_id, creator_id: application.creator_id },
        });
        if (existing)
            return existing;
        const platformFee = this.calculatePlatformFee(amount);
        const creatorAmount = Math.max(0, amount - platformFee);
        return this.prisma.escrow.create({
            data: {
                campaign_id: application.campaign_id,
                brand_id: application.campaign.brand_id,
                creator_id: application.creator_id,
                amount,
                platform_fee_percent: constants_1.PLATFORM_FEE_PERCENT,
                platform_fee_amount: platformFee,
                platform_fee: platformFee,
                creator_amount: creatorAmount,
                status: constants_1.ESCROW_STATUSES.PENDING,
            },
        });
    }
    async lockFundsOnApplicationAccept(application) {
        return this.createPendingEscrowOnApplicationAccept(application);
    }
    async fundPendingEscrow(escrowId, params) {
        const escrow = await this.getEscrowWithRelations(escrowId);
        if (escrow.status !== constants_1.ESCROW_STATUSES.PENDING) {
            throw new common_1.BadRequestException(`Cannot fund escrow in ${escrow.status} status`);
        }
        if (escrow.brand.user_id !== params.brandUserId) {
            throw new common_1.ForbiddenException('Only the brand can fund escrow');
        }
        const amount = params.amount;
        const platformFee = this.calculatePlatformFee(amount);
        const creatorAmount = Math.max(0, amount - platformFee);
        const now = new Date();
        const result = await this.prisma.$transaction(async (tx) => {
            await this.wallet.moveToPending(tx, params.brandUserId, amount, escrowId);
            const updated = await tx.escrow.update({
                where: { id: escrowId },
                data: {
                    amount,
                    platform_fee_percent: constants_1.PLATFORM_FEE_PERCENT,
                    platform_fee_amount: platformFee,
                    platform_fee: platformFee,
                    creator_amount: creatorAmount,
                    status: constants_1.ESCROW_STATUSES.HELD,
                    locked_at: now,
                    funded_at: now,
                },
                include: {
                    campaign: { select: { title: true } },
                    brand: { include: { user: { select: { id: true, name: true } } } },
                    creator: { include: { user: { select: { id: true, name: true } } } },
                },
            });
            const brandWallet = await this.wallet.ensureWallet(params.brandUserId, tx);
            return { escrow: updated, brandWallet };
        });
        await this.notifyEscrowHeld(result.escrow, params.brandUserId, params.creatorUserId, params.campaignTitle);
        (0, wallet_event_emitter_1.emitWalletEvent)(params.brandUserId, 'wallet:updated', this.wallet.formatWallet(result.brandWallet));
        (0, wallet_event_emitter_1.emitWalletEvent)(params.brandUserId, 'escrow:funded', result.escrow);
        (0, wallet_event_emitter_1.emitWalletEvent)(params.creatorUserId, 'escrow:funded', result.escrow);
        return result.escrow;
    }
    async lockFundsForEscrow(params) {
        const platformFee = this.calculatePlatformFee(params.amount);
        const result = await this.prisma.$transaction(async (tx) => {
            await this.wallet.moveToPending(tx, params.brandUserId, params.amount);
            const escrow = await tx.escrow.create({
                data: {
                    campaign_id: params.campaignId,
                    brand_id: params.brandId,
                    creator_id: params.creatorId,
                    amount: params.amount,
                    platform_fee: platformFee,
                    status: constants_1.ESCROW_STATUSES.HELD,
                    locked_at: new Date(),
                },
                include: {
                    campaign: { select: { title: true } },
                    brand: { include: { user: { select: { id: true, name: true } } } },
                    creator: { include: { user: { select: { id: true, name: true } } } },
                },
            });
            const brandWallet = await this.wallet.ensureWallet(params.brandUserId, tx);
            return { escrow, brandWallet };
        });
        await this.notifyEscrowHeld(result.escrow, params.brandUserId, params.creatorUserId, params.campaignTitle);
        (0, wallet_event_emitter_1.emitWalletEvent)(params.brandUserId, 'wallet:updated', result.brandWallet);
        (0, wallet_event_emitter_1.emitWalletEvent)(params.brandUserId, 'escrow:created', result.escrow);
        (0, wallet_event_emitter_1.emitWalletEvent)(params.creatorUserId, 'escrow:created', result.escrow);
        return result.escrow;
    }
    async notifyEscrowHeld(escrow, brandUserId, creatorUserId, campaignTitle) {
        await Promise.all([
            this.notifications.create({
                userId: brandUserId,
                title: 'Escrow Secured',
                message: `₹${escrow.amount.toLocaleString()} locked in escrow for ${campaignTitle}.`,
                type: 'PAYMENT',
                entityType: 'Escrow',
                entityId: escrow.id,
            }),
            this.notifications.create({
                userId: creatorUserId,
                title: 'Escrow Secured',
                message: `₹${escrow.amount.toLocaleString()} is held in escrow for ${campaignTitle}. You can start work.`,
                type: 'PAYMENT',
                entityType: 'Escrow',
                entityId: escrow.id,
            }),
        ]);
    }
    async releaseEscrow(userId, escrowId, options) {
        const escrow = await this.getEscrowWithRelations(escrowId);
        if (!options?.systemRelease && escrow.brand.user_id !== userId) {
            throw new common_1.ForbiddenException('Only the brand can release escrow');
        }
        return this.releaseEscrowInternal(escrow, options?.reason);
    }
    async adminReleaseEscrow(escrowId, reason) {
        const escrow = await this.getEscrowWithRelations(escrowId);
        return this.releaseEscrowInternal(escrow, reason ?? 'Released by admin');
    }
    async adminRefundEscrow(escrowId) {
        const escrow = await this.getEscrowWithRelations(escrowId);
        return this.refundEscrowInternal(escrow);
    }
    async releaseEscrowByCampaignCreator(campaignId, creatorId, reason) {
        const escrow = await this.prisma.escrow.findFirst({
            where: { campaign_id: campaignId, creator_id: creatorId },
            include: {
                campaign: true,
                brand: { include: { user: true } },
                creator: { include: { user: true } },
            },
        });
        if (!escrow)
            throw new common_1.NotFoundException('Escrow not found for this campaign');
        return this.releaseEscrowInternal(escrow, reason);
    }
    async releaseEscrowInternal(escrow, reason) {
        if (escrow.status === constants_1.ESCROW_STATUSES.RELEASED)
            return escrow;
        if (escrow.status !== constants_1.ESCROW_STATUSES.HELD && escrow.status !== constants_1.ESCROW_STATUSES.DISPUTED) {
            throw new common_1.BadRequestException(`Cannot release escrow in ${escrow.status} status`);
        }
        const platformFeeAmount = escrow.platform_fee_amount ?? escrow.platform_fee ?? this.calculatePlatformFee(escrow.amount);
        const creatorPayout = escrow.creator_amount ?? Math.max(0, escrow.amount - platformFeeAmount);
        const result = await this.prisma.$transaction(async (tx) => {
            await this.wallet.releaseLocked(tx, escrow.brand.user_id, escrow.amount, escrow.id);
            const creatorResult = await this.wallet.creditCreatorPayout(tx, escrow.creator.user_id, creatorPayout, escrow.id);
            await this.platformWallet.creditPlatformFee(tx, platformFeeAmount, escrow.id);
            const updated = await tx.escrow.update({
                where: { id: escrow.id },
                data: { status: constants_1.ESCROW_STATUSES.RELEASED, released_at: new Date() },
                include: {
                    campaign: { select: { title: true } },
                    brand: { include: { user: { select: { id: true } } } },
                    creator: { include: { user: { select: { id: true } } } },
                },
            });
            return { escrow: updated, creatorWallet: creatorResult.wallet, creatorPayout };
        });
        const releaseMessage = reason
            ? reason
            : `₹${result.creatorPayout.toLocaleString()} has been released to your wallet.`;
        await Promise.all([
            this.notifications.create({
                userId: escrow.creator.user_id,
                title: 'Payment Released',
                message: releaseMessage,
                type: 'PAYMENT',
                entityType: 'Escrow',
                entityId: escrow.id,
            }),
            this.notifications.create({
                userId: escrow.brand.user_id,
                title: 'Escrow Released',
                message: `Escrow of ₹${escrow.amount.toLocaleString()} was released to the creator.`,
                type: 'PAYMENT',
                entityType: 'Escrow',
                entityId: escrow.id,
            }),
        ]);
        (0, wallet_event_emitter_1.emitWalletEvent)(escrow.creator.user_id, 'wallet:updated', this.wallet.formatWallet(result.creatorWallet));
        (0, wallet_event_emitter_1.emitWalletEvent)(escrow.brand.user_id, 'escrow:released', result.escrow);
        (0, wallet_event_emitter_1.emitWalletEvent)(escrow.creator.user_id, 'escrow:released', result.escrow);
        return result.escrow;
    }
    async refundEscrow(userId, escrowId) {
        const escrow = await this.getEscrowWithRelations(escrowId);
        if (escrow.brand.user_id !== userId)
            throw new common_1.ForbiddenException('Only the brand can refund escrow');
        return this.refundEscrowInternal(escrow);
    }
    async refundEscrowInternal(escrow) {
        if (escrow.status === constants_1.ESCROW_STATUSES.REFUNDED)
            return escrow;
        if (escrow.status !== constants_1.ESCROW_STATUSES.HELD && escrow.status !== constants_1.ESCROW_STATUSES.DISPUTED) {
            throw new common_1.BadRequestException(`Cannot refund escrow in ${escrow.status} status`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            if (escrow.status === constants_1.ESCROW_STATUSES.HELD || escrow.status === constants_1.ESCROW_STATUSES.DISPUTED) {
                await this.wallet.refundLockedToAvailable(tx, escrow.brand.user_id, escrow.amount, escrow.id);
            }
            const updated = await tx.escrow.update({
                where: { id: escrow.id },
                data: { status: constants_1.ESCROW_STATUSES.REFUNDED, refunded_at: new Date() },
            });
            const brandWallet = await this.wallet.ensureWallet(escrow.brand.user_id, tx);
            return { escrow: updated, brandWallet };
        });
        await this.notifications.create({
            userId: escrow.brand.user_id,
            title: 'Escrow Refunded',
            message: `₹${escrow.amount.toLocaleString()} has been refunded to your wallet.`,
            type: 'PAYMENT',
            entityType: 'Escrow',
            entityId: escrow.id,
        });
        (0, wallet_event_emitter_1.emitWalletEvent)(escrow.brand.user_id, 'wallet:updated', this.wallet.formatWallet(result.brandWallet));
        return result.escrow;
    }
    async openDispute(userId, role, dto) {
        if (role === 'brand') {
            return this.openBrandDispute(userId, dto);
        }
        return this.openCreatorDispute(userId, dto);
    }
    async openBrandDispute(userId, dto) {
        if (!dto.creator_id)
            throw new common_1.BadRequestException('creator_id is required');
        const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
        if (!brand)
            throw new common_1.ForbiddenException('Brand profile required');
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: dto.campaign_id, brand_id: brand.id },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return this.createDisputeRecord({
            campaignId: dto.campaign_id,
            creatorId: dto.creator_id,
            brandId: brand.id,
            reason: dto.reason,
            raisedBy: 'brand',
            campaignTitle: campaign.title,
            brandName: brand.company_name,
        });
    }
    async openCreatorDispute(userId, dto) {
        const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
        if (!creator)
            throw new common_1.ForbiddenException('Creator profile required');
        const campaign = await this.prisma.campaign.findUnique({ where: { id: dto.campaign_id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return this.createDisputeRecord({
            campaignId: dto.campaign_id,
            creatorId: creator.id,
            brandId: campaign.brand_id,
            reason: dto.reason,
            raisedBy: 'creator',
            campaignTitle: campaign.title,
            brandName: undefined,
            creatorName: creator.full_name ?? undefined,
        });
    }
    async createDisputeRecord(params) {
        const existing = await this.prisma.dispute.findFirst({
            where: {
                campaign_id: params.campaignId,
                creator_id: params.creatorId,
                status: { in: constants_1.OPEN_DISPUTE_STATUSES },
            },
        });
        if (existing)
            throw new common_1.BadRequestException('An open dispute already exists for this campaign');
        const dispute = await this.prisma.$transaction(async (tx) => {
            const created = await tx.dispute.create({
                data: {
                    campaign_id: params.campaignId,
                    creator_id: params.creatorId,
                    brand_id: params.brandId,
                    reason: params.reason,
                    raised_by: params.raisedBy,
                    status: constants_1.DISPUTE_STATUSES.OPEN,
                },
                include: {
                    campaign: { select: { title: true } },
                    creator: { include: { user: { select: { id: true, name: true } } } },
                    brand: { include: { user: { select: { id: true, name: true } } } },
                },
            });
            await tx.escrow.updateMany({
                where: {
                    campaign_id: params.campaignId,
                    creator_id: params.creatorId,
                    brand_id: params.brandId,
                    status: constants_1.ESCROW_STATUSES.HELD,
                },
                data: { status: constants_1.ESCROW_STATUSES.DISPUTED },
            });
            return created;
        });
        await this.notifications.notifyAdmins({
            title: 'Dispute Raised',
            message: `A dispute was opened on ${params.campaignTitle}.`,
            type: 'DISPUTE',
            entityType: 'Dispute',
            entityId: dispute.id,
        });
        const notifyIds = [dispute.creator.user_id, dispute.brand.user_id];
        await Promise.all(notifyIds.map((uid) => this.notifications.create({
            userId: uid,
            title: 'Dispute Created',
            message: `A dispute was opened for ${params.campaignTitle}.`,
            type: 'DISPUTE',
            entityType: 'Dispute',
            entityId: dispute.id,
        })));
        return this.formatDispute(dispute);
    }
    async getEscrowWithRelations(escrowId) {
        const escrow = await this.prisma.escrow.findUnique({
            where: { id: escrowId },
            include: {
                campaign: true,
                brand: { include: { user: true } },
                creator: { include: { user: true } },
            },
        });
        if (!escrow)
            throw new common_1.NotFoundException('Escrow not found');
        return escrow;
    }
    assertEscrowAccess(userId, escrow) {
        if (escrow.brand.user_id !== userId && escrow.creator.user_id !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
    }
    formatEscrow(escrow) {
        return {
            id: escrow.id,
            campaignId: escrow.campaign_id,
            campaignTitle: escrow.campaign?.title,
            brandId: escrow.brand_id,
            creatorId: escrow.creator_id,
            amount: escrow.amount,
            platformFee: escrow.platform_fee ?? 0,
            creatorPayout: Math.max(0, Number(escrow.amount) - Number(escrow.platform_fee ?? 0)),
            status: escrow.status,
            lockedAt: escrow.locked_at?.toISOString?.() ?? escrow.locked_at ?? null,
            createdAt: escrow.created_at?.toISOString?.() ?? escrow.created_at,
            releasedAt: escrow.released_at?.toISOString?.() ?? escrow.released_at ?? null,
        };
    }
    formatDispute(row) {
        return {
            id: row.id,
            campaignId: row.campaign_id,
            campaignTitle: row.campaign?.title ?? '',
            creator: row.creator?.full_name ?? row.creator?.user?.name ?? 'Creator',
            brand: row.brand?.company_name ?? row.brand?.user?.name ?? 'Brand',
            reason: row.reason,
            raisedBy: row.raised_by,
            status: row.status.toLowerCase(),
            openedAt: row.created_at.toISOString(),
        };
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        platform_wallet_service_1.PlatformWalletService,
        notifications_service_1.NotificationsService])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map