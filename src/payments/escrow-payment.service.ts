import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { emitWalletEvent } from '../common/wallet-event-emitter';
import {
  ESCROW_STATUSES,
  PAYMENT_ORDER_PURPOSES,
} from './constants';
import { EscrowService } from './escrow.service';
import { PlatformWalletService } from './platform-wallet.service';
import { RazorpayService } from './razorpay.service';
import { WalletService } from './wallet.service';

@Injectable()
export class EscrowPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayService,
    private readonly wallet: WalletService,
    private readonly notifications: NotificationsService,
    private readonly escrowService: EscrowService,
    private readonly platformWallet: PlatformWalletService,
  ) {}

  async createEscrowPaymentOrder(userId: string, escrowId: string) {
    const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
    if (!brand) throw new ForbiddenException('Brand profile required');

    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        campaign: { select: { title: true } },
        creator: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!escrow) throw new NotFoundException('Escrow not found');
    if (escrow.brand_id !== brand.id) throw new ForbiddenException('Not your escrow');
    if (escrow.status !== ESCROW_STATUSES.PENDING) {
      throw new BadRequestException(`Escrow is already ${escrow.status}`);
    }

    const breakdown = this.escrowService.getBrandFundingBreakdown(escrow.amount);

    return this.razorpay.createOrder(userId, breakdown.brandTotal, {
      purpose: PAYMENT_ORDER_PURPOSES.ESCROW_FUND,
      escrowId: escrow.id,
      notes: {
        escrow_id: escrow.id,
        campaign_id: escrow.campaign_id,
        creator_id: escrow.creator_id,
        creator_amount: String(breakdown.creatorAmount),
        platform_fee: String(breakdown.platformFee),
      },
    });
  }

  async verifyEscrowPayment(
    userId: string,
    dto: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ) {
    const paymentOrder = await this.prisma.paymentOrder.findUnique({
      where: { razorpay_order_id: dto.razorpay_order_id },
    });
    if (!paymentOrder) throw new NotFoundException('Payment order not found');
    if (paymentOrder.user_id !== userId) {
      throw new BadRequestException('Payment order does not belong to this user');
    }
    if (paymentOrder.purpose !== PAYMENT_ORDER_PURPOSES.ESCROW_FUND || !paymentOrder.escrow_id) {
      throw new BadRequestException('Not an escrow payment order');
    }
    if (paymentOrder.status === 'PAID') {
      const escrow = await this.prisma.escrow.findUnique({ where: { id: paymentOrder.escrow_id } });
      return { escrow, alreadyProcessed: true };
    }

    if (!this.razorpay.verifyPaymentSignature(dto)) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    return this.fundEscrowFromPayment(paymentOrder.escrow_id, {
      razorpay_order_id: dto.razorpay_order_id,
      razorpay_payment_id: dto.razorpay_payment_id,
      brandUserId: userId,
    });
  }

  async fundEscrowFromWebhook(orderId: string, paymentId: string) {
    const paymentOrder = await this.prisma.paymentOrder.findUnique({
      where: { razorpay_order_id: orderId },
    });
    if (!paymentOrder || paymentOrder.status === 'PAID') return null;
    if (paymentOrder.purpose !== PAYMENT_ORDER_PURPOSES.ESCROW_FUND || !paymentOrder.escrow_id) {
      return null;
    }

    return this.fundEscrowFromPayment(paymentOrder.escrow_id, {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      brandUserId: paymentOrder.user_id,
    });
  }

  private async fundEscrowFromPayment(
    escrowId: string,
    params: { razorpay_order_id: string; razorpay_payment_id: string; brandUserId: string },
  ) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        campaign: { select: { title: true } },
        brand: { include: { user: true } },
        creator: { include: { user: true } },
      },
    });
    if (!escrow) throw new NotFoundException('Escrow not found');
    if (escrow.brand.user_id !== params.brandUserId) {
      throw new ForbiddenException('Payment does not match escrow brand');
    }
    if (escrow.status === ESCROW_STATUSES.HELD) {
      return { escrow, alreadyProcessed: true };
    }
    if (escrow.status !== ESCROW_STATUSES.PENDING) {
      throw new BadRequestException(`Cannot fund escrow in ${escrow.status} status`);
    }

    const breakdown = this.escrowService.getBrandFundingBreakdown(escrow.amount);
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.paymentOrder.update({
        where: { razorpay_order_id: params.razorpay_order_id },
        data: {
          status: 'PAID',
          razorpay_payment_id: params.razorpay_payment_id,
        },
      });

      await this.wallet.lockEscrowFromGateway(
        tx,
        params.brandUserId,
        breakdown.creatorAmount,
        escrow.id,
        params.razorpay_payment_id,
      );

      if (breakdown.platformFee > 0) {
        await this.platformWallet.creditPlatformFee(tx, breakdown.platformFee, escrow.id);
      }

      const updated = await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          status: ESCROW_STATUSES.HELD,
          platform_fee_percent: breakdown.platformFeePercent,
          platform_fee_amount: breakdown.platformFee,
          platform_fee: breakdown.platformFee,
          creator_amount: breakdown.creatorAmount,
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
      message: `₹${breakdown.brandTotal.toLocaleString()} paid (₹${breakdown.creatorAmount.toLocaleString()} in escrow + ₹${breakdown.platformFee.toLocaleString()} platform fee) for ${result.escrow.campaign.title}.`,
      type: 'PAYMENT',
      entityType: 'Escrow',
      entityId: escrow.id,
    });

    await this.notifications.create({
      userId: escrow.creator.user_id,
      title: 'Payment Secured',
      message: `₹${breakdown.creatorAmount.toLocaleString()} is held in escrow for ${result.escrow.campaign.title}. You may start working.`,
      type: 'PAYMENT',
      entityType: 'Escrow',
      entityId: escrow.id,
    });

    emitWalletEvent(params.brandUserId, 'wallet:updated', this.wallet.formatWallet(result.brandWallet));
    emitWalletEvent(params.brandUserId, 'escrow:funded', result.escrow);
    emitWalletEvent(escrow.creator.user_id, 'escrow:funded', result.escrow);

    return { escrow: result.escrow };
  }
}
