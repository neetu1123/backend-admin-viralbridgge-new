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
    async ensureWallet(userId, tx) {
        const client = tx ?? this.prisma;
        return client.wallet.upsert({
            where: { user_id: userId },
            update: {},
            create: { user_id: userId },
        });
    }
    async getWallet(userId) {
        return this.ensureWallet(userId);
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
    async createPaymentOrder(userId, amount) {
        const order = await this.razorpay.createOrder(userId, amount);
        return order;
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
        return this.creditWallet(userId, dto.amount, constants_1.TRANSACTION_TYPES.ADD_FUNDS);
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
        if (paymentOrder.status === 'PAID') {
            const wallet = await this.ensureWallet(userId);
            return { wallet, alreadyProcessed: true };
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
            const result = await this.creditWalletInternal(tx, userId, paymentOrder.amount, constants_1.TRANSACTION_TYPES.ADD_FUNDS, paymentOrder.id);
            await this.notifications.create({
                userId,
                title: 'Funds Added',
                message: `₹${paymentOrder.amount.toLocaleString()} has been added to your wallet.`,
                type: 'PAYMENT',
                entityType: 'Transaction',
                entityId: result.transaction.id,
            });
            (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'wallet:updated', result.wallet);
            return result;
        });
    }
    async creditWallet(userId, amount, type, referenceId) {
        const result = await this.prisma.$transaction((tx) => this.creditWalletInternal(tx, userId, amount, type, referenceId));
        await this.notifications.create({
            userId,
            title: 'Funds Added',
            message: `₹${amount.toLocaleString()} has been added to your wallet.`,
            type: 'PAYMENT',
            entityType: 'Transaction',
            entityId: result.transaction.id,
        });
        (0, wallet_event_emitter_1.emitWalletEvent)(userId, 'wallet:updated', result.wallet);
        return result;
    }
    async creditWalletInternal(tx, userId, amount, type, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { available_balance: { increment: amount } },
        });
        const transaction = await tx.transaction.create({
            data: {
                wallet_id: wallet.id,
                type,
                amount,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
                reference_id: referenceId,
            },
        });
        return { wallet: updatedWallet, transaction };
    }
    async debitAvailable(tx, userId, amount, type, referenceId, status = constants_1.TRANSACTION_STATUSES.COMPLETED) {
        const wallet = await this.ensureWallet(userId, tx);
        if (wallet.available_balance < amount) {
            throw new common_1.BadRequestException('Insufficient available balance');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { available_balance: { decrement: amount } },
        });
        const transaction = await tx.transaction.create({
            data: {
                wallet_id: wallet.id,
                type,
                amount,
                status,
                reference_id: referenceId,
            },
        });
        return { wallet: updatedWallet, transaction };
    }
    async moveToPending(tx, userId, amount, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        if (wallet.available_balance < amount) {
            throw new common_1.BadRequestException('Insufficient wallet balance to lock escrow funds');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                available_balance: { decrement: amount },
                pending_balance: { increment: amount },
            },
        });
        const transaction = await tx.transaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.ESCROW_LOCK,
                amount,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
                reference_id: referenceId,
            },
        });
        return { wallet: updatedWallet, transaction };
    }
    async releasePending(tx, userId, amount) {
        const wallet = await this.ensureWallet(userId, tx);
        if (wallet.pending_balance < amount) {
            throw new common_1.BadRequestException('Insufficient pending balance');
        }
        return tx.wallet.update({
            where: { id: wallet.id },
            data: { pending_balance: { decrement: amount } },
        });
    }
    async refundPendingToAvailable(tx, userId, amount, referenceId) {
        const wallet = await this.ensureWallet(userId, tx);
        if (wallet.pending_balance < amount) {
            throw new common_1.BadRequestException('Insufficient pending balance to refund');
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                pending_balance: { decrement: amount },
                available_balance: { increment: amount },
            },
        });
        const transaction = await tx.transaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.REFUND,
                amount,
                status: constants_1.TRANSACTION_STATUSES.COMPLETED,
                reference_id: referenceId,
            },
        });
        return { wallet: updatedWallet, transaction };
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