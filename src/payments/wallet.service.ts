import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserActivityService } from '../user-activity/user-activity.service';
import { emitWalletEvent } from '../common/wallet-event-emitter';
import { paginationMeta } from '../common/dto/pagination-query.dto';
import {
  PAYMENT_ORDER_PURPOSES,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from './constants';
import { AddFundsDto, TransactionQueryDto } from './dto/wallet.dto';
import { RazorpayService } from './razorpay.service';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly razorpay: RazorpayService,
    private readonly userActivity: UserActivityService,
  ) {}

  private touchWalletActivity(userId: string) {
    void this.userActivity.recordWalletActivity(userId).catch(() => undefined);
  }

  formatWallet(wallet: {
    id: string;
    user_id: string;
    available_balance: number;
    locked_balance: number;
    pending_balance: number;
    lifetime_earnings: number;
    currency: string;
    is_frozen: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
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

  async ensureWallet(userId: string, tx?: TxClient) {
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

  async getWallet(userId: string) {
    const wallet = await this.ensureWallet(userId);
    return this.formatWallet(wallet);
  }

  assertWalletActive(wallet: { is_frozen: boolean }) {
    if (wallet.is_frozen) {
      throw new BadRequestException('Wallet is frozen. Contact support.');
    }
  }

  async getTransactions(userId: string, query: TransactionQueryDto) {
    const wallet = await this.ensureWallet(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.WalletTransactionWhereInput = { wallet_id: wallet.id };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async createPaymentOrder(userId: string, amount: number) {
    return this.razorpay.createOrder(userId, amount, { purpose: PAYMENT_ORDER_PURPOSES.WALLET_TOPUP });
  }

  async addFunds(userId: string, dto: AddFundsDto) {
    if (dto.razorpay_order_id && dto.razorpay_payment_id && dto.razorpay_signature) {
      return this.verifyAndCredit(userId, {
        razorpay_order_id: dto.razorpay_order_id,
        razorpay_payment_id: dto.razorpay_payment_id,
        razorpay_signature: dto.razorpay_signature,
      });
    }

    if (this.razorpay.isConfigured()) {
      throw new BadRequestException(
        'Razorpay payment verification required. Create an order first, then submit payment details.',
      );
    }

    return this.creditWallet(userId, dto.amount, TRANSACTION_TYPES.TOPUP);
  }

  async verifyAndCredit(
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
    if (paymentOrder.purpose === PAYMENT_ORDER_PURPOSES.ESCROW_FUND) {
      throw new BadRequestException('Use escrow payment verification for this order');
    }
    if (paymentOrder.status === 'PAID') {
      const wallet = await this.ensureWallet(userId);
      return { wallet: this.formatWallet(wallet), alreadyProcessed: true };
    }

    const valid = this.razorpay.verifyPaymentSignature(dto);
    if (!valid) throw new BadRequestException('Invalid Razorpay payment signature');

    return this.prisma.$transaction(async (tx) => {
      await tx.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          status: 'PAID',
          razorpay_payment_id: dto.razorpay_payment_id,
        },
      });

      const result = await this.creditWalletInternal(
        tx,
        userId,
        paymentOrder.amount,
        TRANSACTION_TYPES.TOPUP,
        'PaymentOrder',
        paymentOrder.id,
      );

      await this.notifications.create({
        userId,
        title: 'Funds Added',
        message: `₹${paymentOrder.amount.toLocaleString()} has been added to your wallet.`,
        type: 'PAYMENT',
        entityType: 'WalletTransaction',
        entityId: result.transaction.id,
      });

      emitWalletEvent(userId, 'wallet:updated', result.wallet);
      this.touchWalletActivity(userId);
      return { wallet: this.formatWallet(result.wallet), transaction: result.transaction };
    });
  }

  async creditWallet(userId: string, amount: number, type: string, referenceId?: string) {
    const result = await this.prisma.$transaction((tx) =>
      this.creditWalletInternal(tx, userId, amount, type, 'Manual', referenceId),
    );

    await this.notifications.create({
      userId,
      title: 'Funds Added',
      message: `₹${amount.toLocaleString()} has been added to your wallet.`,
      type: 'PAYMENT',
      entityType: 'WalletTransaction',
      entityId: result.transaction.id,
    });

    emitWalletEvent(userId, 'wallet:updated', this.formatWallet(result.wallet));
    this.touchWalletActivity(userId);
    return { wallet: this.formatWallet(result.wallet), transaction: result.transaction };
  }

  async creditWalletInternal(
    tx: TxClient,
    userId: string,
    amount: number,
    type: string,
    referenceType?: string,
    referenceId?: string,
  ) {
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
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    });
    return { wallet: updatedWallet, transaction };
  }

  async creditCreatorPayout(
    tx: TxClient,
    userId: string,
    amount: number,
    referenceId?: string,
  ) {
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
        type: TRANSACTION_TYPES.ESCROW_RELEASE,
        amount,
        balance_after: updatedWallet.available_balance,
        reference_type: 'Escrow',
        reference_id: referenceId,
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    });
    return { wallet: updatedWallet, transaction };
  }

  async debitAvailable(
    tx: TxClient,
    userId: string,
    amount: number,
    type: string,
    referenceType?: string,
    referenceId?: string,
    status = TRANSACTION_STATUSES.COMPLETED,
  ) {
    const wallet = await this.ensureWallet(userId, tx);
    this.assertWalletActive(wallet);
    if (wallet.available_balance < amount) {
      throw new BadRequestException('Insufficient available balance');
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

  /** Deduct platform fee from brand available balance when funding escrow. */
  async chargeBrandPlatformFee(
    tx: TxClient,
    userId: string,
    amount: number,
    referenceId?: string,
  ) {
    if (amount <= 0) {
      return this.ensureWallet(userId, tx);
    }
    const wallet = await this.ensureWallet(userId, tx);
    this.assertWalletActive(wallet);
    if (wallet.available_balance < amount) {
      throw new BadRequestException('Insufficient wallet balance for platform fee');
    }
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { available_balance: { decrement: amount } },
    });
    await tx.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: TRANSACTION_TYPES.PLATFORM_FEE,
        amount,
        balance_after: updatedWallet.available_balance,
        reference_type: 'Escrow',
        reference_id: referenceId,
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    });
    return updatedWallet;
  }

  /** Lock brand funds for escrow from wallet balance. */
  async moveToPending(tx: TxClient, userId: string, amount: number, referenceId?: string) {
    const wallet = await this.ensureWallet(userId, tx);
    this.assertWalletActive(wallet);
    if (wallet.available_balance < amount) {
      throw new BadRequestException('Insufficient wallet balance to lock escrow funds');
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
        type: TRANSACTION_TYPES.ESCROW_LOCK,
        amount,
        balance_after: updatedWallet.available_balance,
        reference_type: 'Escrow',
        reference_id: referenceId,
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    });
    return { wallet: updatedWallet, transaction };
  }

  /** Lock brand funds after external Razorpay escrow payment (no available debit). */
  async lockEscrowFromGateway(
    tx: TxClient,
    userId: string,
    amount: number,
    referenceId?: string,
    paymentId?: string,
  ) {
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
        type: TRANSACTION_TYPES.ESCROW_LOCK,
        amount,
        balance_after: updatedWallet.available_balance,
        reference_type: 'Escrow',
        reference_id: referenceId,
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    });
    return { wallet: updatedWallet, transaction, paymentId };
  }

  async releaseLocked(tx: TxClient, userId: string, amount: number, referenceId?: string) {
    const wallet = await this.ensureWallet(userId, tx);
    if (wallet.locked_balance < amount) {
      throw new BadRequestException('Insufficient locked balance');
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

  async refundLockedToAvailable(tx: TxClient, userId: string, amount: number, referenceId?: string) {
    const wallet = await this.ensureWallet(userId, tx);
    if (wallet.locked_balance < amount) {
      throw new BadRequestException('Insufficient locked balance to refund');
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
        type: TRANSACTION_TYPES.REFUND,
        amount,
        balance_after: updatedWallet.available_balance,
        reference_type: 'Escrow',
        reference_id: referenceId,
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    });
    return { wallet: updatedWallet };
  }

  /** @deprecated alias */
  async releasePending(tx: TxClient, userId: string, amount: number) {
    return this.releaseLocked(tx, userId, amount);
  }

  /** @deprecated alias */
  async refundPendingToAvailable(tx: TxClient, userId: string, amount: number, referenceId?: string) {
    return this.refundLockedToAvailable(tx, userId, amount, referenceId);
  }
}
