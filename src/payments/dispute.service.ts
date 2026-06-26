import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginationMeta } from '../common/dto/pagination-query.dto';
import {
  DISPUTE_STATUSES,
  ESCROW_STATUSES,
  OPEN_DISPUTE_STATUSES,
  TRANSACTION_TYPES,
} from './constants';
import { ResolveDisputeDto } from './dto/escrow.dto';
import { DisputeQueryDto } from './dto/withdrawal.dto';
import { EscrowService } from './escrow.service';
import { WalletService } from './wallet.service';

const disputeInclude = {
  campaign: { select: { id: true, title: true } },
  creator: { include: { user: { select: { id: true, name: true } } } },
  brand: { include: { user: { select: { id: true, name: true } } } },
} as const;

function priorityFromAmount(amount: number): 'high' | 'medium' | 'low' {
  if (amount >= 10000) return 'high';
  if (amount >= 3000) return 'medium';
  return 'low';
}

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly escrow: EscrowService,
    private readonly notifications: NotificationsService,
  ) {}

  async listAdminDisputes(query: Partial<DisputeQueryDto> = {}) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 50);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') {
      where.status = query.status.toUpperCase();
    }

    const [rows, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: disputeInclude,
      }),
      this.prisma.dispute.count({ where }),
    ]);

    let data = await Promise.all(rows.map((row) => this.formatDisputeRow(row)));

    if (query.raised_by) {
      const rb = query.raised_by.toLowerCase();
      data = data.filter((d) => d.raisedBy === rb);
    }
    if (query.priority) {
      const p = query.priority.toLowerCase();
      data = data.filter((d) => d.priority === p);
    }

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAdminDisputeStats() {
    const [openRows, resolvedCount] = await Promise.all([
      this.prisma.dispute.findMany({
        where: { status: { in: OPEN_DISPUTE_STATUSES } },
        include: disputeInclude,
      }),
      this.prisma.dispute.count({
        where: { status: { in: [DISPUTE_STATUSES.RESOLVED, DISPUTE_STATUSES.REFUNDED] } },
      }),
    ]);

    const formatted = await Promise.all(openRows.map((row) => this.formatDisputeRow(row)));
    const totalAtStake = formatted.reduce((sum, d) => sum + d.amount, 0);

    return { openCount: openRows.length, totalAtStake, resolvedCount };
  }

  async getAdminDispute(id: string) {
    const row = await this.prisma.dispute.findUnique({ where: { id }, include: disputeInclude });
    if (!row) throw new NotFoundException('Dispute not found');
    return this.formatDisputeRow(row);
  }

  async resolveDispute(id: string, adminId: string, dto: ResolveDisputeDto) {
    if (dto.creator_amount != null || dto.brand_amount != null) {
      return this.partialResolveDispute(id, adminId, dto);
    }
    return this.settleDispute(id, adminId, 'release_creator', dto.notes);
  }

  async refundDispute(id: string, adminId: string, notes?: string) {
    return this.settleDispute(id, adminId, 'refund_brand', notes);
  }

  async escalateDispute(id: string, adminId: string) {
    const dispute = await this.getDisputeOrThrow(id);
    await this.prisma.dispute.update({
      where: { id },
      data: { status: DISPUTE_STATUSES.IN_REVIEW },
    });
    await this.writeAudit(adminId, 'ESCALATE_DISPUTE', id);
    return this.getAdminDispute(id);
  }

  private async partialResolveDispute(id: string, adminId: string, dto: ResolveDisputeDto) {
    const creatorAmount = Number(dto.creator_amount) || 0;
    const brandAmount = Number(dto.brand_amount) || 0;
    if (creatorAmount <= 0 && brandAmount <= 0) {
      throw new BadRequestException('creator_amount or brand_amount is required for partial payout');
    }
    return this.settleDispute(id, adminId, 'partial', dto.notes, { creatorAmount, brandAmount });
  }

  private async settleDispute(
    id: string,
    adminId: string,
    mode: 'release_creator' | 'refund_brand' | 'partial',
    notes?: string,
    partial?: { creatorAmount: number; brandAmount: number },
  ) {
    const dispute = await this.getDisputeOrThrow(id);
    const escrow = await this.findEscrow(dispute.campaign_id, dispute.creator_id, dispute.brand_id);
    if (!escrow) throw new BadRequestException('No escrow found for this dispute');

    await this.prisma.$transaction(async (tx) => {
      if (mode === 'release_creator') {
        const creatorPayout = Math.max(0, escrow.amount - (escrow.platform_fee ?? 0));
        await this.wallet.releasePending(tx, escrow.brand.user_id, escrow.amount);
        await this.wallet.creditWalletInternal(
          tx,
          escrow.creator.user_id,
          creatorPayout,
          TRANSACTION_TYPES.ESCROW_RELEASE,
          escrow.id,
        );
        await tx.escrow.update({
          where: { id: escrow.id },
          data: { status: ESCROW_STATUSES.RELEASED, released_at: new Date() },
        });
      } else if (mode === 'refund_brand') {
        await this.wallet.refundPendingToAvailable(tx, escrow.brand.user_id, escrow.amount, escrow.id);
        await tx.escrow.update({
          where: { id: escrow.id },
          data: { status: ESCROW_STATUSES.REFUNDED, released_at: new Date() },
        });
      } else if (mode === 'partial' && partial) {
        const total = partial.creatorAmount + partial.brandAmount;
        if (total > escrow.amount) {
          throw new BadRequestException('Partial amounts exceed escrow total');
        }
        await this.wallet.releasePending(tx, escrow.brand.user_id, total);
        if (partial.creatorAmount > 0) {
          await this.wallet.creditWalletInternal(
            tx,
            escrow.creator.user_id,
            partial.creatorAmount,
            TRANSACTION_TYPES.ESCROW_RELEASE,
            escrow.id,
          );
        }
        if (partial.brandAmount > 0) {
          await this.wallet.creditWalletInternal(
            tx,
            escrow.brand.user_id,
            partial.brandAmount,
            TRANSACTION_TYPES.REFUND,
            escrow.id,
          );
        }
        await tx.escrow.update({
          where: { id: escrow.id },
          data: { status: ESCROW_STATUSES.RELEASED, released_at: new Date() },
        });
      }

      await tx.dispute.update({
        where: { id },
        data: {
          status: mode === 'refund_brand' ? DISPUTE_STATUSES.REFUNDED : DISPUTE_STATUSES.RESOLVED,
          resolution_notes: notes,
        },
      });
    });

    await this.writeAudit(adminId, `${mode.toUpperCase()}_DISPUTE`, id, { notes, partial });

    const formatted = await this.getAdminDispute(id);
    const notifyIds = [dispute.creator.user_id, dispute.brand.user_id];
    await Promise.all(
      notifyIds.map((userId) =>
        this.notifications.create({
          userId,
          title: 'Dispute Resolved',
          message: `Dispute for ${formatted.campaignTitle} has been resolved by admin.`,
          type: 'DISPUTE',
          entityType: 'Dispute',
          entityId: id,
        }),
      ),
    );

    return formatted;
  }

  async listUserDisputes(userId: string, role: 'brand' | 'creator') {
    let where: Record<string, unknown> = {};
    if (role === 'brand') {
      const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
      if (!brand) return [];
      where = { brand_id: brand.id };
    } else {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
      if (!creator) return [];
      where = { creator_id: creator.id };
    }

    const rows = await this.prisma.dispute.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: disputeInclude,
    });
    return Promise.all(rows.map((row) => this.formatDisputeRow(row)));
  }

  private async getDisputeOrThrow(id: string) {
    const row = await this.prisma.dispute.findUnique({ where: { id }, include: disputeInclude });
    if (!row) throw new NotFoundException('Dispute not found');
    return row;
  }

  private async findEscrow(campaignId: string, creatorId: string, brandId: string) {
    return this.prisma.escrow.findFirst({
      where: { campaign_id: campaignId, creator_id: creatorId, brand_id: brandId },
      orderBy: { created_at: 'desc' },
      include: {
        creator: { select: { user_id: true } },
        brand: { select: { user_id: true } },
      },
    });
  }

  private async formatDisputeRow(row: {
    id: string;
    campaign_id: string;
    creator_id: string;
    brand_id: string;
    reason: string;
    raised_by: string;
    status: string;
    created_at: Date;
    campaign?: { title?: string } | null;
    creator?: { full_name?: string | null; user?: { name?: string | null } | null } | null;
    brand?: { company_name?: string | null; user?: { name?: string | null } | null } | null;
  }) {
    const escrow = await this.findEscrow(row.campaign_id, row.creator_id, row.brand_id);
    const amount = escrow?.amount ?? 0;

    return {
      ...this.escrow.formatDispute(row),
      amount,
      priority: priorityFromAmount(amount),
    };
  }

  private async writeAudit(adminId: string, action: string, entityId: string, metadata?: unknown) {
    await this.prisma.auditLog.create({
      data: {
        admin_id: adminId,
        action,
        entity: 'Dispute',
        entity_id: entityId,
        metadata: metadata as object | undefined,
      },
    });
  }
}
