import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { emitWalletEvent } from '../common/wallet-event-emitter';
import { paginationMeta } from '../common/dto/pagination-query.dto';
import { TRANSACTION_STATUSES, TRANSACTION_TYPES, WITHDRAWAL_STATUSES } from './constants';
import { RequestWithdrawalDto, WithdrawalQueryDto } from './dto/withdrawal.dto';
import { WalletService } from './wallet.service';

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly notifications: NotificationsService,
  ) {}

  async requestWithdrawal(userId: string, dto: RequestWithdrawalDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user?.role || !['CREATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role.name)) {
      throw new ForbiddenException('Only creators can request withdrawals');
    }

    const wallet = await this.wallet.ensureWallet(userId);
    if (wallet.available_balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { available_balance: { decrement: dto.amount } },
      });
      const transaction = await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          type: TRANSACTION_TYPES.WITHDRAWAL,
          amount: dto.amount,
          status: WITHDRAWAL_STATUSES.PENDING,
        },
      });
      return { wallet: updatedWallet, transaction };
    });

    await this.notifications.notifyAdmins({
      title: 'Withdrawal Requested',
      message: `${user.name} requested a withdrawal of ₹${dto.amount.toLocaleString()}.`,
      type: 'WITHDRAWAL',
      entityType: 'Transaction',
      entityId: result.transaction.id,
    });

    await this.notifications.create({
      userId,
      title: 'Withdrawal Requested',
      message: `Your withdrawal request of ₹${dto.amount.toLocaleString()} is pending admin review.`,
      type: 'WITHDRAWAL',
      entityType: 'Transaction',
      entityId: result.transaction.id,
    });

    emitWalletEvent(userId, 'wallet:updated', result.wallet);
    emitWalletEvent(userId, 'withdrawal:requested', result.transaction);

    return result;
  }

  async listUserWithdrawals(userId: string, query: WithdrawalQueryDto) {
    const wallet = await this.wallet.ensureWallet(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {
      wallet_id: wallet.id,
      type: TRANSACTION_TYPES.WITHDRAWAL,
    };
    if (query.status) where.status = query.status.toUpperCase();

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

  async listAdminWithdrawals(status = 'PENDING') {
    const normalized = status.toUpperCase();
    const statuses =
      normalized === WITHDRAWAL_STATUSES.APPROVED
        ? [WITHDRAWAL_STATUSES.APPROVED, WITHDRAWAL_STATUSES.COMPLETED]
        : [normalized];

    return this.prisma.transaction.findMany({
      where: {
        type: TRANSACTION_TYPES.WITHDRAWAL,
        status: statuses.length === 1 ? statuses[0] : { in: statuses },
      },
      include: { wallet: { include: { user: { include: { role: true } } } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async approveWithdrawal(id: string, adminId?: string) {
    const txn = await this.getWithdrawalOrThrow(id);
    if (txn.status !== WITHDRAWAL_STATUSES.PENDING) {
      throw new BadRequestException('Withdrawal is not pending');
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status: WITHDRAWAL_STATUSES.APPROVED },
      include: { wallet: { include: { user: true } } },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'APPROVE_WITHDRAWAL',
          entity: 'Transaction',
          entity_id: id,
          metadata: { amount: updated.amount },
        },
      });
    }

    const userId = updated.wallet?.user_id;
    if (userId) {
      await this.notifications.create({
        userId,
        title: 'Withdrawal Approved',
        message: `Your withdrawal of ₹${updated.amount.toLocaleString()} has been approved.`,
        type: 'WITHDRAWAL',
        entityType: 'Transaction',
        entityId: id,
      });
      emitWalletEvent(userId, 'withdrawal:approved', updated);
    }

    return updated;
  }

  async rejectWithdrawal(id: string, adminId?: string, reason?: string) {
    const txn = await this.getWithdrawalOrThrow(id);
    if (txn.status !== WITHDRAWAL_STATUSES.PENDING) {
      throw new BadRequestException('Withdrawal is not pending');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: { status: WITHDRAWAL_STATUSES.REJECTED },
        include: { wallet: { include: { user: true } } },
      });
      if (txn.wallet) {
        await tx.wallet.update({
          where: { id: txn.wallet.id },
          data: { available_balance: { increment: txn.amount } },
        });
      }
      return result;
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'REJECT_WITHDRAWAL',
          entity: 'Transaction',
          entity_id: id,
          metadata: { amount: updated.amount, reason },
        },
      });
    }

    const userId = updated.wallet?.user_id;
    if (userId) {
      const refreshedWallet = await this.wallet.ensureWallet(userId);
      await this.notifications.create({
        userId,
        title: 'Withdrawal Rejected',
        message: reason ?? `Your withdrawal of ₹${updated.amount.toLocaleString()} was rejected. Funds returned to wallet.`,
        type: 'WITHDRAWAL',
        entityType: 'Transaction',
        entityId: id,
      });
      emitWalletEvent(userId, 'wallet:updated', refreshedWallet);
    }

    return updated;
  }

  private async getWithdrawalOrThrow(id: string) {
    const txn = await this.prisma.transaction.findUnique({
      where: { id },
      include: { wallet: true },
    });
    if (!txn || txn.type !== TRANSACTION_TYPES.WITHDRAWAL) {
      throw new NotFoundException('Withdrawal not found');
    }
    return txn;
  }
}
