"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RazorpayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const prisma_service_1 = require("../prisma/prisma.service");
const constants_1 = require("./constants");
let RazorpayService = RazorpayService_1 = class RazorpayService {
    config;
    prisma;
    logger = new common_1.Logger(RazorpayService_1.name);
    client = null;
    keyId;
    keySecret;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.keyId = this.config.get('RAZORPAY_KEY_ID');
        this.keySecret = this.config.get('RAZORPAY_KEY_SECRET');
        if (this.keyId && this.keySecret) {
            this.client = new razorpay_1.default({ key_id: this.keyId, key_secret: this.keySecret });
        }
        else {
            this.logger.warn('Razorpay keys not configured — running in mock payment mode');
        }
    }
    isConfigured() {
        return Boolean(this.client && this.keyId && this.keySecret);
    }
    getPublicKey() {
        return this.keyId ?? null;
    }
    async createOrder(userId, amount) {
        const amountPaise = Math.round(amount * 100);
        if (amountPaise < 100) {
            throw new Error('Minimum order amount is ₹1');
        }
        if (!this.client) {
            const mockOrderId = `order_mock_${Date.now()}`;
            const row = await this.prisma.paymentOrder.create({
                data: {
                    user_id: userId,
                    razorpay_order_id: mockOrderId,
                    amount,
                    status: constants_1.PAYMENT_ORDER_STATUSES.CREATED,
                    metadata: { mock: true },
                },
            });
            return {
                orderId: mockOrderId,
                amount,
                currency: 'INR',
                keyId: null,
                paymentOrderId: row.id,
                mock: true,
            };
        }
        const order = await this.client.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: `wallet_${userId.slice(0, 8)}_${Date.now()}`,
            notes: { user_id: userId },
        });
        const row = await this.prisma.paymentOrder.create({
            data: {
                user_id: userId,
                razorpay_order_id: order.id,
                amount,
                currency: 'INR',
                status: constants_1.PAYMENT_ORDER_STATUSES.CREATED,
                metadata: order,
            },
        });
        return {
            orderId: order.id,
            amount,
            currency: 'INR',
            keyId: this.keyId,
            paymentOrderId: row.id,
            mock: false,
        };
    }
    verifyPaymentSignature(dto) {
        if (!this.keySecret) {
            return dto.razorpay_order_id.startsWith('order_mock_');
        }
        const body = `${dto.razorpay_order_id}|${dto.razorpay_payment_id}`;
        const expected = crypto
            .createHmac('sha256', this.keySecret)
            .update(body)
            .digest('hex');
        return expected === dto.razorpay_signature;
    }
    verifyWebhookSignature(rawBody, signature) {
        if (!this.keySecret)
            return false;
        const webhookSecret = this.config.get('RAZORPAY_WEBHOOK_SECRET') ?? this.keySecret;
        const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
        return expected === signature;
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = RazorpayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map