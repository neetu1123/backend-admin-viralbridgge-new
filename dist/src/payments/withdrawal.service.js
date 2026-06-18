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
exports.WithdrawalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const wallet_event_emitter_1 = require("../common/wallet-event-emitter");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const constants_1 = require("./constants");
const wallet_service_1 = require("./wallet.service");
let WithdrawalService = class WithdrawalService {
    prisma;
    wallet;
    notifications;
    constructor(prisma, wallet, notifications) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.notifications = notifications;
    }
    async requestWithdrawal(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });
        if (!user?.role || !['CREATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role.name)) {
            throw new common_1.ForbiddenException('Only creators can request withdrawals');
        }
        const wallet = await this.wallet.ensureWallet(userId);
        if (wallet.available_balance < dto.amount) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { available_balance: { decrement: dto.amount } },
            });
            const transaction = await tx.transaction.create({
                data: {
                    wallet_id: wallet.id,
                    type: constants_1.TRANSACTION_TYPES.WITHDRAWAL,
                    amount: dto.amount,
                    status: constants_1.WITHDRAWAL_STATUSES.PENDING,
                },
            });
            return { wallet: updatedWallet, transaction };
        });
        await this.notifications.notifyAdmins({
            title: 'Withdrawal Requested',
            message: `${user.name} requested a withdrawal of ₹${dto.amount.toLocaleString()}.`,
            type: 'WITHDRAWAL',
            entityType: 'Transaction',
            entityId: result.transaction.id,
        });
        await this.notifications.create({
            userId,
            title: 'Withdrawal Requested',
            message: `Your withdrawal request of ₹${dto.amount.toLocaleString()} is pending admin review.`,
            type: 'WITHDRAWAL',
            entityType: 'Transaction',
            entityId: result.transaction.id,
        });
        (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'wallet:updated', result.wallet);
        (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'withdrawal:requested', result.transaction);
        return result;
    }
    async listUserWithdrawals(userId, query) {
        const wallet = await this.wallet.ensureWallet(userId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            wallet_id: wallet.id,
            type: constants_1.TRANSACTION_TYPES.WITHDRAWAL,
        };
        if (query.status)
            where.status = query.status.toUpperCase();
        const [data, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return { data, meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async listAdminWithdrawals(status = 'PENDING') {
        const normalized = status.toUpperCase();
        const statuses = normalized === constants_1.WITHDRAWAL_STATUSES.APPROVED
            ? [constants_1.WITHDRAWAL_STATUSES.APPROVED, constants_1.WITHDRAWAL_STATUSES.COMPLETED]
            : [normalized];
        return this.prisma.transaction.findMany({
            where: {
                type: constants_1.TRANSACTION_TYPES.WITHDRAWAL,
                status: statuses.length === 1 ? statuses[0] : { in: statuses },
            },
            include: { wallet: { include: { user: { include: { role: true } } } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async approveWithdrawal(id, adminId) {
        const txn = await this.getWithdrawalOrThrow(id);
        if (txn.status !== constants_1.WITHDRAWAL_STATUSES.PENDING) {
            throw new common_1.BadRequestException('Withdrawal is not pending');
        }
        const updated = await this.prisma.transaction.update({
            where: { id },
            data: { status: constants_1.WITHDRAWAL_STATUSES.APPROVED },
            include: { wallet: { include: { user: true } } },
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    admin_id: adminId,
                    action: 'APPROVE_WITHDRAWAL',
                    entity: 'Transaction',
                    entity_id: id,
                    metadata: { amount: updated.amount },
                },
            });
        }
        const userId = updated.wallet?.user_id;
        if (userId) {
            await this.notifications.create({
                userId,
                title: 'Withdrawal Approved',
                message: `Your withdrawal of ₹${updated.amount.toLocaleString()} has been approved.`,
                type: 'WITHDRAWAL',
                entityType: 'Transaction',
                entityId: id,
            });
            (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'withdrawal:approved', updated);
        }
        return updated;
    }
    async rejectWithdrawal(id, adminId, reason) {
        const txn = await this.getWithdrawalOrThrow(id);
        if (txn.status !== constants_1.WITHDRAWAL_STATUSES.PENDING) {
            throw new common_1.BadRequestException('Withdrawal is not pending');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.transaction.update({
                where: { id },
                data: { status: constants_1.WITHDRAWAL_STATUSES.REJECTED },
                include: { wallet: { include: { user: true } } },
            });
            if (txn.wallet) {
                await tx.wallet.update({
                    where: { id: txn.wallet.id },
                    data: { available_balance: { increment: txn.amount } },
                });
            }
            return result;
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    admin_id: adminId,
                    action: 'REJECT_WITHDRAWAL',
                    entity: 'Transaction',
                    entity_id: id,
                    metadata: { amount: updated.amount, reason },
                },
            });
        }
        const userId = updated.wallet?.user_id;
        if (userId) {
            const refreshedWallet = await this.wallet.ensureWallet(userId);
            await this.notifications.create({
                userId,
                title: 'Withdrawal Rejected',
                message: reason ?? `Your withdrawal of ₹${updated.amount.toLocaleString()} was rejected. Funds returned to wallet.`,
                type: 'WITHDRAWAL',
                entityType: 'Transaction',
                entityId: id,
            });
            (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'wallet:updated', refreshedWallet);
        }
        return updated;
    }
    async getWithdrawalOrThrow(id) {
        const txn = await this.prisma.transaction.findUnique({
            where: { id },
            include: { wallet: true },
        });
        if (!txn || txn.type !== constants_1.TRANSACTION_TYPES.WITHDRAWAL) {
            throw new common_1.NotFoundException('Withdrawal not found');
        }
        return txn;
    }
};
exports.WithdrawalService = WithdrawalService;
exports.WithdrawalService = WithdrawalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        notifications_service_1.NotificationsService])
], WithdrawalService);
//# sourceMappingURL=withdrawal.service.js.map