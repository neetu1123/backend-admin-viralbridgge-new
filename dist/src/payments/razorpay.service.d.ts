import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class RazorpayService {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private client;
    private keyId;
    private keySecret;
    constructor(config: ConfigService, prisma: PrismaService);
    isConfigured(): boolean;
    getPublicKey(): string | null;
    createOrder(userId: string, amount: number): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: null;
        paymentOrderId: string;
        mock: boolean;
    } | {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string | undefined;
        paymentOrderId: string;
        mock: boolean;
    }>;
    verifyPaymentSignature(dto: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): boolean;
    verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
