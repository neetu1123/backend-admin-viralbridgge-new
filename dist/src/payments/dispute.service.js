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
exports.DisputeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const constants_1 = require("./constants");
const escrow_service_1 = require("./escrow.service");
const wallet_service_1 = require("./wallet.service");
const disputeInclude = {
    campaign: { select: { id: true, title: true } },
    creator: { include: { user: { select: { id: true, name: true } } } },
    brand: { include: { user: { select: { id: true, name: true } } } },
};
function priorityFromAmount(amount) {
    if (amount >= 10000)
        return 'high';
    if (amount >= 3000)
        return 'medium';
    return 'low';
}
let DisputeService = class DisputeService {
    prisma;
    wallet;
    escrow;
    notifications;
    constructor(prisma, wallet, escrow, notifications) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.escrow = escrow;
        this.notifications = notifications;
    }
    async listAdminDisputes(query = {}) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, query.limit ?? 50);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status && query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }
        const [rows, total] = await Promise.all([
            this.prisma.dispute.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: disputeInclude,
            }),
            this.prisma.dispute.count({ where }),
        ]);
        let data = await Promise.all(rows.map((row) => this.formatDisputeRow(row)));
        if (query.raised_by) {
            const rb = query.raised_by.toLowerCase();
            data = data.filter((d) => d.raisedBy === rb);
        }
        if (query.priority) {
            const p = query.priority.toLowerCase();
            data = data.filter((d) => d.priority === p);
        }
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getAdminDisputeStats() {
        const [openRows, resolvedCount] = await Promise.all([
            this.prisma.dispute.findMany({
                where: { status: { in: constants_1.OPEN_DISPUTE_STATUSES } },
                include: disputeInclude,
            }),
            this.prisma.dispute.count({
                where: { status: { in: [constants_1.DISPUTE_STATUSES.RESOLVED, constants_1.DISPUTE_STATUSES.REFUNDED] } },
            }),
        ]);
        const formatted = await Promise.all(openRows.map((row) => this.formatDisputeRow(row)));
        const totalAtStake = formatted.reduce((sum, d) => sum + d.amount, 0);
        return { openCount: openRows.length, totalAtStake, resolvedCount };
    }
    async getAdminDispute(id) {
        const row = await this.prisma.dispute.findUnique({ where: { id }, include: disputeInclude });
        if (!row)
            throw new common_1.NotFoundException('Dispute not found');
        return this.formatDisputeRow(row);
    }
    async resolveDispute(id, adminId, dto) {
        if (dto.creator_amount != null || dto.brand_amount != null) {
            return this.partialResolveDispute(id, adminId, dto);
        }
        return this.settleDispute(id, adminId, 'release_creator', dto.notes);
    }
    async refundDispute(id, adminId, notes) {
        return this.settleDispute(id, adminId, 'refund_brand', notes);
    }
    async escalateDispute(id, adminId) {
        const dispute = await this.getDisputeOrThrow(id);
        await this.prisma.dispute.update({
            where: { id },
            data: { status: constants_1.DISPUTE_STATUSES.IN_REVIEW },
        });
        await this.writeAudit(adminId, 'ESCALATE_DISPUTE', id);
        return this.getAdminDispute(id);
    }
    async partialResolveDispute(id, adminId, dto) {
        const creatorAmount = Number(dto.creator_amount) || 0;
        const brandAmount = Number(dto.brand_amount) || 0;
        if (creatorAmount <= 0 && brandAmount <= 0) {
            throw new common_1.BadRequestException('creator_amount or brand_amount is required for partial payout');
        }
        return this.settleDispute(id, adminId, 'partial', dto.notes, { creatorAmount, brandAmount });
    }
    async settleDispute(id, adminId, mode, notes, partial) {
        const dispute = await this.getDisputeOrThrow(id);
        const escrow = await this.findEscrow(dispute.campaign_id, dispute.creator_id, dispute.brand_id);
        if (!escrow)
            throw new common_1.BadRequestException('No escrow found for this dispute');
        await this.prisma.$transaction(async (tx) => {
            if (mode === 'release_creator') {
                const creatorPayout = escrow.amount;
                await this.wallet.releasePending(tx, escrow.brand.user_id, escrow.amount);
                await this.wallet.creditWalletInternal(tx, escrow.creator.user_id, creatorPayout, constants_1.TRANSACTION_TYPES.ESCROW_RELEASE, escrow.id);
                await tx.escrow.update({
                    where: { id: escrow.id },
                    data: { status: constants_1.ESCROW_STATUSES.RELEASED, released_at: new Date() },
                });
            }
            else if (mode === 'refund_brand') {
                await this.wallet.refundPendingToAvailable(tx, escrow.brand.user_id, escrow.amount, escrow.id);
                await tx.escrow.update({
                    where: { id: escrow.id },
                    data: { status: constants_1.ESCROW_STATUSES.REFUNDED, released_at: new Date() },
                });
            }
            else if (mode === 'partial' && partial) {
                const total = partial.creatorAmount + partial.brandAmount;
                if (total > escrow.amount) {
                    throw new common_1.BadRequestException('Partial amounts exceed escrow total');
                }
                await this.wallet.releasePending(tx, escrow.brand.user_id, total);
                if (partial.creatorAmount > 0) {
                    await this.wallet.creditWalletInternal(tx, escrow.creator.user_id, partial.creatorAmount, constants_1.TRANSACTION_TYPES.ESCROW_RELEASE, escrow.id);
                }
                if (partial.brandAmount > 0) {
                    await this.wallet.creditWalletInternal(tx, escrow.brand.user_id, partial.brandAmount, constants_1.TRANSACTION_TYPES.REFUND, escrow.id);
                }
                await tx.escrow.update({
                    where: { id: escrow.id },
                    data: { status: constants_1.ESCROW_STATUSES.RELEASED, released_at: new Date() },
                });
            }
            await tx.dispute.update({
                where: { id },
                data: {
                    status: mode === 'refund_brand' ? constants_1.DISPUTE_STATUSES.REFUNDED : constants_1.DISPUTE_STATUSES.RESOLVED,
                    resolution_notes: notes,
                },
            });
        });
        await this.writeAudit(adminId, `${mode.toUpperCase()}_DISPUTE`, id, { notes, partial });
        const formatted = await this.getAdminDispute(id);
        const notifyIds = [dispute.creator.user_id, dispute.brand.user_id];
        await Promise.all(notifyIds.map((userId) => this.notifications.create({
            userId,
            title: 'Dispute Resolved',
            message: `Dispute for ${formatted.campaignTitle} has been resolved by admin.`,
            type: 'DISPUTE',
            entityType: 'Dispute',
            entityId: id,
        })));
        return formatted;
    }
    async listUserDisputes(userId, role) {
        let where = {};
        if (role === 'brand') {
            const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
            if (!brand)
                return [];
            where = { brand_id: brand.id };
        }
        else {
            const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
            if (!creator)
                return [];
            where = { creator_id: creator.id };
        }
        const rows = await this.prisma.dispute.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: disputeInclude,
        });
        return Promise.all(rows.map((row) => this.formatDisputeRow(row)));
    }
    async getDisputeOrThrow(id) {
        const row = await this.prisma.dispute.findUnique({ where: { id }, include: disputeInclude });
        if (!row)
            throw new common_1.NotFoundException('Dispute not found');
        return row;
    }
    async findEscrow(campaignId, creatorId, brandId) {
        return this.prisma.escrow.findFirst({
            where: { campaign_id: campaignId, creator_id: creatorId, brand_id: brandId },
            orderBy: { created_at: 'desc' },
            include: {
                creator: { select: { user_id: true } },
                brand: { select: { user_id: true } },
            },
        });
    }
    async formatDisputeRow(row) {
        const escrow = await this.findEscrow(row.campaign_id, row.creator_id, row.brand_id);
        const amount = escrow?.amount ?? 0;
        return {
            ...this.escrow.formatDispute(row),
            amount,
            priority: priorityFromAmount(amount),
        };
    }
    async writeAudit(adminId, action, entityId, metadata) {
        await this.prisma.auditLog.create({
            data: {
                admin_id: adminId,
                action,
                entity: 'Dispute',
                entity_id: entityId,
                metadata: metadata,
            },
        });
    }
};
exports.DisputeService = DisputeService;
exports.DisputeService = DisputeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        escrow_service_1.EscrowService,
        notifications_service_1.NotificationsService])
], DisputeService);
//# sourceMappingURL=dispute.service.js.map