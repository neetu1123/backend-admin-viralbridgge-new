import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_ORDER_STATUSES } from './constants';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private client: Razorpay | null = null;
  private keyId: string | undefined;
  private keySecret: string | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.keyId = this.config.get<string>('RAZORPAY_KEY_ID');
    this.keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (this.keyId && this.keySecret) {
      this.client = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    } else {
      this.logger.warn('Razorpay keys not configured — running in mock payment mode');
    }
  }

  isConfigured() {
    return Boolean(this.client && this.keyId && this.keySecret);
  }

  getPublicKey() {
    return this.keyId ?? null;
  }

  async createOrder(userId: string, amount: number) {
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
          status: PAYMENT_ORDER_STATUSES.CREATED,
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
        status: PAYMENT_ORDER_STATUSES.CREATED,
        metadata: order as object,
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

  verifyPaymentSignature(dto: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
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

  verifyWebhookSignature(rawBody: string, signature: string) {
    if (!this.keySecret) return false;
    const webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET') ?? this.keySecret;
    const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    return expected === signature;
  }
}
