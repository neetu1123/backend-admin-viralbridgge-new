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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const wallet_event_emitter_1 = require("../common/wallet-event-emitter");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const constants_1 = require("./constants");
const razorpay_service_1 = require("./razorpay.service");
let WalletService = class WalletService {
    prisma;
    notifications;
    razorpay;
    constructor(prisma, notifications, razorpay) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.razorpay = razorpay;
    }
    formatWallet(wallet) {
        return {
            id: wallet.id,
            userId: wallet.user_id,
            available_balance: wallet.available_balance,
            locked_balance: wallet.locked_balance,
            pending_balance: wallet.pending_balance,
            lifetime_earnings: wallet.lifetime_earnings,
            currency: wallet.currency,
            is_frozen: wallet.is_frozen,
            createdAt: wallet.created_at.toISOString(),
            updatedAt: wallet.updated_at.toISOString(),
        };
    }
    async ensureWallet(userId, tx) {
        const client = tx ?? this.prisma;
        return client.wallet.upsert({
            where: { user_id: userId },
            update: {},
            create: {
                user_id: userId,
                available_balance: 0,
                locked_balance: 0,
                pending_balance: 0,
                lifetime_earnings: 0,
                currency: 'INR',
            },
        });
    }
    async getWallet(userId) {
        const wallet = await this.ensureWallet(userId);
        return this.formatWallet(wallet);
    }
    assertWalletActive(wallet) {
        if (wallet.is_frozen) {
            throw new common_1.BadRequestException('Wallet is frozen. Contact support.');
        }
    }
    async getTransactions(userId, query) {
        const wallet = await this.ensureWallet(userId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { wallet_id: wallet.id };
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        const [data, total] = await Promise.all([
            this.prisma.walletTransaction.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.walletTransaction.count({ where }),
        ]);
        return { data, meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async createPaymentOrder(userId, amount) {
        return this.razorpay.createOrder(userId, amount, { purpose: constants_1.PAYMENT_ORDER_PURPOSES.WALLET_TOPUP });
    }
    async addFunds(userId, dto) {
        if (dto.razorpay_order_id && dto.razorpay_payment_id && dto.razorpay_signature) {
            return this.verifyAndCredit(userId, {
                razorpay_order_id: dto.razorpay_order_id,
                razorpay_payment_id: dto.razorpay_payment_id,
                razorpay_signature: dto.razorpay_signature,
            });
        }
        if (this.razorpay.isConfigured()) {
            throw new common_1.BadRequestException('Razorpay payment verification required. Create an order first, then submit payment details.');
        }
        return this.creditWallet(userId, dto.amount, constants_1.TRANSACTION_TYPES.TOPUP);
    }
    async verifyAndCredit(userId, dto) {
        const paymentOrder = await this.prisma.paymentOrder.findUnique({
            where: { razorpay_order_id: dto.razorpay_order_id },
        });
        if (!paymentOrder)
            throw new common_1.NotFoundException('Payment order not found');
        if (paymentOrder.user_id !== userId) {
            throw new common_1.BadRequestException('Payment order does not belong to this user');
        }
        if (paymentOrder.purpose === constants_1.PAYMENT_ORDER_PURPOSES.ESCROW_FUND) {
            throw new common_1.BadRequestException('Use escrow payment verification for this order');
        }
        if (paymentOrder.status === 'PAID') {
            const wallet = await this.ensureWallet(userId);
            return { wallet: this.formatWallet(wallet), alreadyProcessed: true };
        }
        const valid = this.razorpay.verifyPaymentSignature(dto);
        if (!valid)
            throw new common_1.BadRequestException('Invalid Razorpay payment signature');
        return this.prisma.$transaction(async (tx) => {
            await tx.paymentOrder.update({
                where: { id: paymentOrder.id },
                data: {
                    status: 'PAID',
                    razorpay_payment_id: dto.razorpay_payment_id,
                },
            });
            const result = await this.creditWalletInternal(tx, userId, paymentOrder.amount, constants_1.TRANSACTION_TYPES.TOPUP, 'PaymentOrder', paymentOrder.id);
            await this.notifications.create({
                userId,
                title: 'Funds Added',
                message: `₹${paymentOrder.amount.toLocaleString()} has been added to your wallet.`,
                type: 'PAYMENT',
                entityType: 'WalletTransaction',
                entityId: result.transaction.id,
            });
            (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'wallet:updated', result.wallet);
            return { wallet: this.formatWallet(result.wallet), transaction: result.transaction };
        });
    }
    async creditWallet(userId, amount, type, referenceId) {
        const result = await this.prisma.$transaction((tx) => this.creditWalletInternal(tx, userId, amount, type, 'Manual', referenceId));
        await this.notifications.create({
            userId,
            title: 'Funds Added',
            message: `₹${amount.toLocaleString()} has been added to your wallet.`,
            type: 'PAYMENT',
            entityType: 'WalletTransaction',
            entityId: result.transaction.id,
        });
        (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'wallet:updated', this.formatWallet(result.wallet));
        return { wallet: this.formatWallet(result.wallet), transaction: result.transaction };
    }
    async creditWalletInternal(tx, userId, amount, type, referenceType, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        this.assertWalletActive(wallet);
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { available_balance: { increment: amount } },
        });
        const transaction = await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type,
                amount,
                balance_after: updatedWallet.available_balance,
                reference_type: referenceType,
                reference_id: referenceId,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
            },
        });
        return { wallet: updatedWallet, transaction };
    }
    async creditCreatorPayout(tx, userId, amount, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        this.assertWalletActive(wallet);
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                available_balance: { increment: amount },
                lifetime_earnings: { increment: amount },
            },
        });
        const transaction = await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.ESCROW_RELEASE,
                amount,
                balance_after: updatedWallet.available_balance,
                reference_type: 'Escrow',
                reference_id: referenceId,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
            },
        });
        return { wallet: updatedWallet, transaction };
    }
    async debitAvailable(tx, userId, amount, type, referenceType, referenceId, status = constants_1.TRANSACTION_STATUSES.COMPLETED) {
        const wallet = await this.ensureWallet(userId, tx);
        this.assertWalletActive(wallet);
        if (wallet.available_balance < amount) {
            throw new common_1.BadRequestException('Insufficient available balance');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { available_balance: { decrement: amount } },
        });
        const transaction = await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type,
                amount,
                balance_after: updatedWallet.available_balance,
                reference_type: referenceType,
                reference_id: referenceId,
                status,
            },
        });
        return { wallet: updatedWallet, transaction };
    }
    async chargeBrandPlatformFee(tx, userId, amount, referenceId) {
        if (amount <= 0) {
            return this.ensureWallet(userId, tx);
        }
        const wallet = await this.ensureWallet(userId, tx);
        this.assertWalletActive(wallet);
        if (wallet.available_balance < amount) {
            throw new common_1.BadRequestException('Insufficient wallet balance for platform fee');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { available_balance: { decrement: amount } },
        });
        await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.PLATFORM_FEE,
                amount,
                balance_after: updatedWallet.available_balance,
                reference_type: 'Escrow',
                reference_id: referenceId,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
            },
        });
        return updatedWallet;
    }
    async moveToPending(tx, userId, amount, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        this.assertWalletActive(wallet);
        if (wallet.available_balance < amount) {
            throw new common_1.BadRequestException('Insufficient wallet balance to lock escrow funds');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                available_balance: { decrement: amount },
                locked_balance: { increment: amount },
                pending_balance: { increment: amount },
            },
        });
        const transaction = await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.ESCROW_LOCK,
                amount,
                balance_after: updatedWallet.available_balance,
                reference_type: 'Escrow',
                reference_id: referenceId,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
            },
        });
        return { wallet: updatedWallet, transaction };
    }
    async lockEscrowFromGateway(tx, userId, amount, referenceId, paymentId) {
        const wallet = await this.ensureWallet(userId, tx);
        this.assertWalletActive(wallet);
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                locked_balance: { increment: amount },
                pending_balance: { increment: amount },
            },
        });
        const transaction = await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.ESCROW_LOCK,
                amount,
                balance_after: updatedWallet.available_balance,
                reference_type: 'Escrow',
                reference_id: referenceId,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
            },
        });
        return { wallet: updatedWallet, transaction, paymentId };
    }
    async releaseLocked(tx, userId, amount, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        if (wallet.locked_balance < amount) {
            throw new common_1.BadRequestException('Insufficient locked balance');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                locked_balance: { decrement: amount },
                pending_balance: { decrement: amount },
            },
        });
        return updatedWallet;
    }
    async refundLockedToAvailable(tx, userId, amount, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        if (wallet.locked_balance < amount) {
            throw new common_1.BadRequestException('Insufficient locked balance to refund');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                locked_balance: { decrement: amount },
                pending_balance: { decrement: amount },
                available_balance: { increment: amount },
            },
        });
        await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.REFUND,
                amount,
                balance_after: updatedWallet.available_balance,
                reference_type: 'Escrow',
                reference_id: referenceId,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
            },
        });
        return { wallet: updatedWallet };
    }
    async releasePending(tx, userId, amount) {
        return this.releaseLocked(tx, userId, amount);
    }
    async refundPendingToAvailable(tx, userId, amount, referenceId) {
        return this.refundLockedToAvailable(tx, userId, amount, referenceId);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        razorpay_service_1.RazorpayService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map