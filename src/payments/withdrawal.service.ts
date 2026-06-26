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
      include: { role: true, creator_profile: true },
    });
    if (!user?.role || !['CREATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role.name)) {
      throw new ForbiddenException('Only creators can request withdrawals');
    }

    const creatorProfile = user.creator_profile ?? await this.prisma.creatorProfile.findUnique({
      where: { user_id: userId },
    });
    if (!creatorProfile) throw new ForbiddenException('Creator profile required');

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
      const withdrawal = await tx.withdrawal.create({
        data: {
          creator_id: creatorProfile.id,
          amount: dto.amount,
          status: WITHDRAWAL_STATUSES.PENDING,
          transaction_id: transaction.id,
        },
      });
      return { wallet: updatedWallet, transaction, withdrawal };
    });

    await this.notifications.notifyAdmins({
      title: 'Withdrawal Requested',
      message: `${user.name} requested a withdrawal of ₹${dto.amount.toLocaleString()}.`,
      type: 'WITHDRAWAL',
      entityType: 'Withdrawal',
      entityId: result.withdrawal.id,
    });

    await this.notifications.create({
      userId,
      title: 'Withdrawal Requested',
      message: `Your withdrawal request of ₹${dto.amount.toLocaleString()} is pending admin review.`,
      type: 'WITHDRAWAL',
      entityType: 'Withdrawal',
      entityId: result.withdrawal.id,
    });

    emitWalletEvent(userId, 'wallet:updated', result.wallet);
    emitWalletEvent(userId, 'withdrawal:requested', this.formatWithdrawal(result.withdrawal));

    return this.formatWithdrawal(result.withdrawal);
  }

  async listUserWithdrawals(userId: string, query: WithdrawalQueryDto) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
    if (!creator) {
      return { data: [], meta: paginationMeta(query.page ?? 1, query.limit ?? 20, 0) };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = { creator_id: creator.id };
    if (query.status) where.status = query.status.toUpperCase();

    const [rows, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        orderBy: { requested_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return { data: rows.map((w) => this.formatWithdrawal(w)), meta: paginationMeta(page, limit, total) };
  }

  async listAdminWithdrawals(status = 'PENDING') {
    const normalized = status.toUpperCase();
    const statuses =
      normalized === WITHDRAWAL_STATUSES.APPROVED
        ? [WITHDRAWAL_STATUSES.APPROVED, WITHDRAWAL_STATUSES.COMPLETED]
        : [normalized];

    const rows = await this.prisma.withdrawal.findMany({
      where: {
        status: statuses.length === 1 ? statuses[0] : { in: statuses },
      },
      include: {
        creator: { include: { user: { include: { role: true } } } },
      },
      orderBy: { requested_at: 'desc' },
    });

    return rows.map((w) => ({
      ...this.formatWithdrawal(w),
      creator: w.creator.full_name ?? w.creator.user.name,
      creatorEmail: w.creator.user.email,
    }));
  }

  async approveWithdrawal(id: string, adminId?: string) {
    const withdrawal = await this.getWithdrawalOrThrow(id);
    if (withdrawal.status !== WITHDRAWAL_STATUSES.PENDING) {
      throw new BadRequestException('Withdrawal is not pending');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.withdrawal.update({
        where: { id },
        data: { status: WITHDRAWAL_STATUSES.APPROVED, approved_at: new Date() },
        include: { creator: { include: { user: true } } },
      });
      if (result.transaction_id) {
        await tx.transaction.update({
          where: { id: result.transaction_id },
          data: { status: WITHDRAWAL_STATUSES.APPROVED },
        });
      }
      return result;
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'APPROVE_WITHDRAWAL',
          entity: 'Withdrawal',
          entity_id: id,
          metadata: { amount: updated.amount },
        },
      });
    }

    const userId = updated.creator.user_id;
    await this.notifications.create({
      userId,
      title: 'Withdrawal Approved',
      message: `Your withdrawal of ₹${updated.amount.toLocaleString()} has been approved. Funds will be transferred to your bank account.`,
      type: 'WITHDRAWAL',
      entityType: 'Withdrawal',
      entityId: id,
    });
    emitWalletEvent(userId, 'withdrawal:approved', this.formatWithdrawal(updated));

    return this.formatWithdrawal(updated);
  }

  async rejectWithdrawal(id: string, adminId?: string, reason?: string) {
    const withdrawal = await this.getWithdrawalOrThrow(id);
    if (withdrawal.status !== WITHDRAWAL_STATUSES.PENDING) {
      throw new BadRequestException('Withdrawal is not pending');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.withdrawal.update({
        where: { id },
        data: {
          status: WITHDRAWAL_STATUSES.REJECTED,
          rejected_at: new Date(),
          rejection_reason: reason,
        },
        include: { creator: { include: { user: true } } },
      });

      const userId = result.creator.user_id;
      const wallet = await this.wallet.ensureWallet(userId, tx);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { available_balance: { increment: withdrawal.amount } },
      });

      if (result.transaction_id) {
        await tx.transaction.update({
          where: { id: result.transaction_id },
          data: { status: WITHDRAWAL_STATUSES.REJECTED },
        });
      }

      return result;
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'REJECT_WITHDRAWAL',
          entity: 'Withdrawal',
          entity_id: id,
          metadata: { amount: updated.amount, reason },
        },
      });
    }

    const userId = updated.creator.user_id;
    const refreshedWallet = await this.wallet.ensureWallet(userId);
    await this.notifications.create({
      userId,
      title: 'Withdrawal Rejected',
      message: reason ?? `Your withdrawal of ₹${updated.amount.toLocaleString()} was rejected. Funds returned to wallet.`,
      type: 'WITHDRAWAL',
      entityType: 'Withdrawal',
      entityId: id,
    });
    emitWalletEvent(userId, 'wallet:updated', refreshedWallet);

    return this.formatWithdrawal(updated);
  }

  private async getWithdrawalOrThrow(id: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal) {
      const legacyTxn = await this.prisma.transaction.findUnique({
        where: { id },
        include: { wallet: true },
      });
      if (legacyTxn?.type === TRANSACTION_TYPES.WITHDRAWAL) {
        return {
          id: legacyTxn.id,
          creator_id: '',
          amount: legacyTxn.amount,
          status: legacyTxn.status,
          transaction_id: legacyTxn.id,
          requested_at: legacyTxn.created_at,
          approved_at: null,
          rejected_at: null,
          rejection_reason: null,
          created_at: legacyTxn.created_at,
          updated_at: legacyTxn.updated_at,
        };
      }
      throw new NotFoundException('Withdrawal not found');
    }
    return withdrawal;
  }

  private formatWithdrawal(row: {
    id: string;
    creator_id: string;
    amount: number;
    status: string;
    transaction_id?: string | null;
    requested_at: Date;
    approved_at?: Date | null;
    rejected_at?: Date | null;
    rejection_reason?: string | null;
  }) {
    return {
      id: row.id,
      creatorId: row.creator_id,
      amount: row.amount,
      status: row.status,
      transactionId: row.transaction_id,
      requestedAt: row.requested_at.toISOString(),
      approvedAt: row.approved_at?.toISOString() ?? null,
      rejectedAt: row.rejected_at?.toISOString() ?? null,
      rejectionReason: row.rejection_reason ?? null,
    };
  }
}
