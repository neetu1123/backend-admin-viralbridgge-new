import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { emitWalletEvent } from '../common/wallet-event-emitter';
import { paginationMeta } from '../common/dto/pagination-query.dto';
import {
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
  ) {}

  async ensureWallet(userId: string, tx?: TxClient) {
    const client = tx ?? this.prisma;
    return client.wallet.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });
  }

  async getWallet(userId: string) {
    return this.ensureWallet(userId);
  }

  async getTransactions(userId: string, query: TransactionQueryDto) {
    const wallet = await this.ensureWallet(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.TransactionWhereInput = { wallet_id: wallet.id };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async createPaymentOrder(userId: string, amount: number) {
    const order = await this.razorpay.createOrder(userId, amount);
    return order;
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

    return this.creditWallet(userId, dto.amount, TRANSACTION_TYPES.ADD_FUNDS);
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
    if (paymentOrder.status === 'PAID') {
      const wallet = await this.ensureWallet(userId);
      return { wallet, alreadyProcessed: true };
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
        TRANSACTION_TYPES.ADD_FUNDS,
        paymentOrder.id,
      );

      await this.notifications.create({
        userId,
        title: 'Funds Added',
        message: `₹${paymentOrder.amount.toLocaleString()} has been added to your wallet.`,
        type: 'PAYMENT',
        entityType: 'Transaction',
        entityId: result.transaction.id,
      });

      emitWalletEvent(userId, 'wallet:updated', result.wallet);
      return result;
    });
  }

  async creditWallet(userId: string, amount: number, type: string, referenceId?: string) {
    const result = await this.prisma.$transaction((tx) =>
      this.creditWalletInternal(tx, userId, amount, type, referenceId),
    );

    await this.notifications.create({
      userId,
      title: 'Funds Added',
      message: `₹${amount.toLocaleString()} has been added to your wallet.`,
      type: 'PAYMENT',
      entityType: 'Transaction',
      entityId: result.transaction.id,
    });

    emitWalletEvent(userId, 'wallet:updated', result.wallet);
    return result;
  }

  async creditWalletInternal(
    tx: TxClient,
    userId: string,
    amount: number,
    type: string,
    referenceId?: string,
  ) {
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
        status: TRANSACTION_STATUSES.COMPLETED,
        reference_id: referenceId,
      },
    });
    return { wallet: updatedWallet, transaction };
  }

  async debitAvailable(
    tx: TxClient,
    userId: string,
    amount: number,
    type: string,
    referenceId?: string,
    status = TRANSACTION_STATUSES.COMPLETED,
  ) {
    const wallet = await this.ensureWallet(userId, tx);
    if (wallet.available_balance < amount) {
      throw new BadRequestException('Insufficient available balance');
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

  async moveToPending(tx: TxClient, userId: string, amount: number, referenceId?: string) {
    const wallet = await this.ensureWallet(userId, tx);
    if (wallet.available_balance < amount) {
      throw new BadRequestException('Insufficient wallet balance to lock escrow funds');
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
        type: TRANSACTION_TYPES.ESCROW_LOCK,
        amount,
        status: TRANSACTION_STATUSES.COMPLETED,
        reference_id: referenceId,
      },
    });
    return { wallet: updatedWallet, transaction };
  }

  async releasePending(tx: TxClient, userId: string, amount: number) {
    const wallet = await this.ensureWallet(userId, tx);
    if (wallet.pending_balance < amount) {
      throw new BadRequestException('Insufficient pending balance');
    }
    return tx.wallet.update({
      where: { id: wallet.id },
      data: { pending_balance: { decrement: amount } },
    });
  }

  async refundPendingToAvailable(tx: TxClient, userId: string, amount: number, referenceId?: string) {
    const wallet = await this.ensureWallet(userId, tx);
    if (wallet.pending_balance < amount) {
      throw new BadRequestException('Insufficient pending balance to refund');
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
        type: TRANSACTION_TYPES.REFUND,
        amount,
        status: TRANSACTION_STATUSES.COMPLETED,
        reference_id: referenceId,
      },
    });
    return { wallet: updatedWallet, transaction };
  }
}
