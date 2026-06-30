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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const escrow_payment_service_1 = require("./escrow-payment.service");
const razorpay_service_1 = require("./razorpay.service");
const prisma_service_1 = require("../prisma/prisma.service");
const constants_1 = require("./constants");
let RazorpayWebhookController = class RazorpayWebhookController {
    razorpay;
    wallet;
    escrowPayment;
    prisma;
    constructor(razorpay, wallet, escrowPayment, prisma) {
        this.razorpay = razorpay;
        this.wallet = wallet;
        this.escrowPayment = escrowPayment;
        this.prisma = prisma;
    }
    async handleWebhook(req, signature, body) {
        const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
        if (!this.razorpay.verifyWebhookSignature(rawBody, signature)) {
            return { success: false, message: 'Invalid signature' };
        }
        const event = body.event;
        const payload = body.payload;
        if (event === 'payment.captured') {
            const payment = payload?.payment?.entity;
            const orderId = payment?.order_id;
            const paymentId = payment?.id;
            if (orderId && paymentId) {
                const order = await this.prisma.paymentOrder.findUnique({
                    where: { razorpay_order_id: orderId },
                });
                if (order && order.status !== 'PAID') {
                    if (order.purpose === constants_1.PAYMENT_ORDER_PURPOSES.ESCROW_FUND) {
                        await this.escrowPayment.fundEscrowFromWebhook(orderId, paymentId);
                    }
                    else {
                        await this.wallet.verifyAndCredit(order.user_id, {
                            razorpay_order_id: orderId,
                            razorpay_payment_id: paymentId,
                            razorpay_signature: signature,
                        });
                    }
                }
            }
        }
        if (event === 'payment.failed') {
            const payment = payload?.payment?.entity;
            const orderId = payment?.order_id;
            if (orderId) {
                await this.prisma.paymentOrder.updateMany({
                    where: { razorpay_order_id: orderId, status: 'CREATED' },
                    data: { status: 'FAILED' },
                });
            }
        }
        return { success: true };
    }
};
exports.RazorpayWebhookController = RazorpayWebhookController;
__decorate([
    (0, common_1.Post)('razorpay'),
    (0, swagger_1.ApiOperation)({ summary: 'Razorpay payment webhook' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RazorpayWebhookController.prototype, "handleWebhook", null);
exports.RazorpayWebhookController = RazorpayWebhookController = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [razorpay_service_1.RazorpayService,
        wallet_service_1.WalletService,
        escrow_payment_service_1.EscrowPaymentService,
        prisma_service_1.PrismaService])
], RazorpayWebhookController);
//# sourceMappingURL=razorpay.webhook.controller.js.map