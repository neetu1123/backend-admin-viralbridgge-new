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
exports.EscrowPaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const wallet_event_emitter_1 = require("../common/wallet-event-emitter");
const constants_1 = require("./constants");
const razorpay_service_1 = require("./razorpay.service");
const wallet_service_1 = require("./wallet.service");
let EscrowPaymentService = class EscrowPaymentService {
    prisma;
    razorpay;
    wallet;
    notifications;
    constructor(prisma, razorpay, wallet, notifications) {
        this.prisma = prisma;
        this.razorpay = razorpay;
        this.wallet = wallet;
        this.notifications = notifications;
    }
    async createEscrowPaymentOrder(userId, escrowId) {
        const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
        if (!brand)
            throw new common_1.ForbiddenException('Brand profile required');
        const escrow = await this.prisma.escrow.findUnique({
            where: { id: escrowId },
            include: {
                campaign: { select: { title: true } },
                creator: { include: { user: { select: { id: true, name: true } } } },
            },
        });
        if (!escrow)
            throw new common_1.NotFoundException('Escrow not found');
        if (escrow.brand_id !== brand.id)
            throw new common_1.ForbiddenException('Not your escrow');
        if (escrow.status !== constants_1.ESCROW_STATUSES.PENDING) {
            throw new common_1.BadRequestException(`Escrow is already ${escrow.status}`);
        }
        return this.razorpay.createOrder(userId, escrow.amount, {
            purpose: constants_1.PAYMENT_ORDER_PURPOSES.ESCROW_FUND,
            escrowId: escrow.id,
            notes: {
                escrow_id: escrow.id,
                campaign_id: escrow.campaign_id,
                creator_id: escrow.creator_id,
            },
        });
    }
    async verifyEscrowPayment(userId, dto) {
        const paymentOrder = await this.prisma.paymentOrder.findUnique({
            where: { razorpay_order_id: dto.razorpay_order_id },
        });
        if (!paymentOrder)
            throw new common_1.NotFoundException('Payment order not found');
        if (paymentOrder.user_id !== userId) {
            throw new common_1.BadRequestException('Payment order does not belong to this user');
        }
        if (paymentOrder.purpose !== constants_1.PAYMENT_ORDER_PURPOSES.ESCROW_FUND || !paymentOrder.escrow_id) {
            throw new common_1.BadRequestException('Not an escrow payment order');
        }
        if (paymentOrder.status === 'PAID') {
            const escrow = await this.prisma.escrow.findUnique({ where: { id: paymentOrder.escrow_id } });
            return { escrow, alreadyProcessed: true };
        }
        if (!this.razorpay.verifyPaymentSignature(dto)) {
            throw new common_1.BadRequestException('Invalid Razorpay payment signature');
        }
        return this.fundEscrowFromPayment(paymentOrder.escrow_id, {
            razorpay_order_id: dto.razorpay_order_id,
            razorpay_payment_id: dto.razorpay_payment_id,
            brandUserId: userId,
        });
    }
    async fundEscrowFromWebhook(orderId, paymentId) {
        const paymentOrder = await this.prisma.paymentOrder.findUnique({
            where: { razorpay_order_id: orderId },
        });
        if (!paymentOrder || paymentOrder.status === 'PAID')
            return null;
        if (paymentOrder.purpose !== constants_1.PAYMENT_ORDER_PURPOSES.ESCROW_FUND || !paymentOrder.escrow_id) {
            return null;
        }
        return this.fundEscrowFromPayment(paymentOrder.escrow_id, {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            brandUserId: paymentOrder.user_id,
        });
    }
    async fundEscrowFromPayment(escrowId, params) {
        const escrow = await this.prisma.escrow.findUnique({
            where: { id: escrowId },
            include: {
                campaign: { select: { title: true } },
                brand: { include: { user: true } },
                creator: { include: { user: true } },
            },
        });
        if (!escrow)
            throw new common_1.NotFoundException('Escrow not found');
        if (escrow.brand.user_id !== params.brandUserId) {
            throw new common_1.ForbiddenException('Payment does not match escrow brand');
        }
        if (escrow.status === constants_1.ESCROW_STATUSES.HELD) {
            return { escrow, alreadyProcessed: true };
        }
        if (escrow.status !== constants_1.ESCROW_STATUSES.PENDING) {
            throw new common_1.BadRequestException(`Cannot fund escrow in ${escrow.status} status`);
        }
        const platformFeePercent = escrow.platform_fee_percent ?? constants_1.PLATFORM_FEE_PERCENT;
        const platformFeeAmount = Math.round((escrow.amount * platformFeePercent) / 100 * 100) / 100;
        const creatorAmount = Math.max(0, escrow.amount - platformFeeAmount);
        const now = new Date();
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.paymentOrder.update({
                where: { razorpay_order_id: params.razorpay_order_id },
                data: {
                    status: 'PAID',
                    razorpay_payment_id: params.razorpay_payment_id,
                },
            });
            await this.wallet.lockEscrowFromGateway(tx, params.brandUserId, escrow.amount, escrow.id, params.razorpay_payment_id);
            const updated = await tx.escrow.update({
                where: { id: escrow.id },
                data: {
                    status: constants_1.ESCROW_STATUSES.HELD,
                    platform_fee_percent: platformFeePercent,
                    platform_fee_amount: platformFeeAmount,
                    platform_fee: platformFeeAmount,
                    creator_amount: creatorAmount,
                    payment_gateway: 'RAZORPAY',
                    payment_id: params.razorpay_payment_id,
                    funded_at: now,
                    locked_at: now,
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
        await this.notifications.create({
            userId: params.brandUserId,
            title: 'Payment Successful',
            message: `₹${escrow.amount.toLocaleString()} secured in escrow for ${result.escrow.campaign.title}.`,
            type: 'PAYMENT',
            entityType: 'Escrow',
            entityId: escrow.id,
        });
        await this.notifications.create({
            userId: escrow.creator.user_id,
            title: 'Payment Secured',
            message: `Payment secured for ${result.escrow.campaign.title}. You may start working.`,
            type: 'PAYMENT',
            entityType: 'Escrow',
            entityId: escrow.id,
        });
        (0, wallet_event_emitter_1.emitWalletEvent)(params.brandUserId, 'wallet:updated', this.wallet.formatWallet(result.brandWallet));
        (0, wallet_event_emitter_1.emitWalletEvent)(params.brandUserId, 'escrow:funded', result.escrow);
        (0, wallet_event_emitter_1.emitWalletEvent)(escrow.creator.user_id, 'escrow:funded', result.escrow);
        return { escrow: result.escrow };
    }
};
exports.EscrowPaymentService = EscrowPaymentService;
exports.EscrowPaymentService = EscrowPaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        razorpay_service_1.RazorpayService,
        wallet_service_1.WalletService,
        notifications_service_1.NotificationsService])
], EscrowPaymentService);
//# sourceMappingURL=escrow-payment.service.js.map