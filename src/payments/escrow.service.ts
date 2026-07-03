import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { emitWalletEvent } from '../common/wallet-event-emitter';
import {
  DISPUTE_STATUSES,
  ESCROW_STATUSES,
  OPEN_DISPUTE_STATUSES,
  PLATFORM_FEE_PERCENT,
  TRANSACTION_TYPES,
} from './constants';
import { CreateEscrowDto, OpenDisputeDto } from './dto/escrow.dto';
import { WalletService } from './wallet.service';
import { PlatformWalletService } from './platform-wallet.service';

@Injectable()
export class EscrowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly platformWallet: PlatformWalletService,
    private readonly notifications: NotificationsService,
  ) {}

  calculatePlatformFee(amount: number): number {
    if (PLATFORM_FEE_PERCENT <= 0) return 0;
    return Math.round((amount * PLATFORM_FEE_PERCENT) / 100 * 100) / 100;
  }

  /** Creator receives the full escrow amount when brand approves deliverables. */
  private resolveCreatorPayout(escrow: { amount: number; creator_amount?: number | null }): number {
    return escrow.amount;
  }

  /** Brand pays campaign amount + platform fee; creator receives only the campaign amount. */
  getBrandFundingBreakdown(creatorAmount: number) {
    const platformFee = this.calculatePlatformFee(creatorAmount);
    return {
      creatorAmount,
      platformFee,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      brandTotal: creatorAmount + platformFee,
    };
  }

  private async fundBrandEscrowFromWallet(
    tx: Prisma.TransactionClient,
    brandUserId: string,
    escrowId: string,
    breakdown: ReturnType<EscrowService['getBrandFundingBreakdown']>,
  ) {
    await this.wallet.moveToPending(tx, brandUserId, breakdown.creatorAmount, escrowId);
    if (breakdown.platformFee > 0) {
      await this.wallet.chargeBrandPlatformFee(tx, brandUserId, breakdown.platformFee, escrowId);
      await this.platformWallet.creditPlatformFee(tx, breakdown.platformFee, escrowId);
    }
  }

  async getEscrow(userId: string, escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        campaign: { select: { id: true, title: true } },
        brand: { include: { user: { select: { id: true, name: true } } } },
        creator: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!escrow) throw new NotFoundException('Escrow not found');
    this.assertEscrowAccess(userId, escrow);
    return this.formatEscrow(escrow);
  }

  async getEscrowForCampaignCreator(campaignId: string, creatorId: string) {
    return this.prisma.escrow.findFirst({
      where: { campaign_id: campaignId, creator_id: creatorId },
      include: {
        campaign: { select: { title: true } },
        brand: { include: { user: true } },
        creator: { include: { user: true } },
      },
    });
  }

  async listEscrows(userId: string, role: 'brand' | 'creator') {
    let escrows;
    if (role === 'brand') {
      const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
      if (!brand) return [];
      escrows = await this.prisma.escrow.findMany({
        where: { brand_id: brand.id },
        include: {
          campaign: { select: { title: true } },
          creator: { include: { user: { select: { name: true } } } },
        },
        orderBy: { created_at: 'desc' },
      });
    } else {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
      if (!creator) return [];
      escrows = await this.prisma.escrow.findMany({
        where: { creator_id: creator.id },
        include: {
          campaign: { select: { title: true } },
          brand: { include: { user: { select: { name: true } } } },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    return Promise.all(
      escrows.map(async (e) => {
        const openDispute = await this.prisma.dispute.findFirst({
          where: {
            campaign_id: e.campaign_id,
            creator_id: e.creator_id,
            status: { in: OPEN_DISPUTE_STATUSES },
          },
        });
        return {
          ...this.formatEscrow(e),
          hasOpenDispute: Boolean(openDispute),
          canDispute: e.status === ESCROW_STATUSES.HELD && !openDispute,
        };
      }),
    );
  }

  async listAdminEscrows(status?: string) {
    const where = status ? { status: status.toUpperCase() } : {};
    const escrows = await this.prisma.escrow.findMany({
      where,
      include: {
        campaign: { select: { id: true, title: true } },
        brand: { include: { user: { select: { id: true, name: true, email: true } } } },
        creator: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { created_at: 'desc' },
    });
    return escrows.map((e) => this.formatEscrow(e));
  }

  async createEscrow(userId: string, dto: CreateEscrowDto) {
    const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
    if (!brand) throw new ForbiddenException('Brand profile required');

    const campaign = await this.prisma.campaign.findFirst({
      where: { id: dto.campaign_id, brand_id: brand.id },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { id: dto.creator_id } });
    if (!creator) throw new NotFoundException('Creator not found');

    const amount = dto.amount ?? campaign.budget;
    if (amount <= 0) throw new BadRequestException('Escrow amount must be greater than zero');

    const existing = await this.prisma.escrow.findFirst({
      where: { campaign_id: dto.campaign_id, creator_id: dto.creator_id },
    });

    if (existing?.status === ESCROW_STATUSES.HELD) {
      throw new BadRequestException('Escrow is already funded and held');
    }
    if (existing?.status === ESCROW_STATUSES.RELEASED) {
      throw new BadRequestException('Escrow has already been released');
    }

    if (existing?.status === ESCROW_STATUSES.PENDING) {
      return this.fundPendingEscrow(existing.id, {
        brandUserId: userId,
        creatorUserId: creator.user_id,
        amount,
        campaignTitle: campaign.title,
      });
    }

    return this.lockFundsForEscrow({
      campaignId: dto.campaign_id,
      brandId: brand.id,
      brandUserId: userId,
      creatorId: dto.creator_id,
      creatorUserId: creator.user_id,
      amount,
      campaignTitle: campaign.title,
    });
  }

  /** Creates a PENDING escrow when brand accepts a creator — funds are not locked yet. */
  async createPendingEscrowOnApplicationAccept(application: {
    campaign_id: string;
    creator_id: string;
    proposed_price?: number | null;
    campaign: { brand_id: string; budget: number; title: string; brand: { user_id: string } };
    creator: { user_id: string };
  }) {
    const amount = application.proposed_price ?? application.campaign.budget;
    if (amount <= 0) return null;

    const existing = await this.prisma.escrow.findFirst({
      where: { campaign_id: application.campaign_id, creator_id: application.creator_id },
    });
    if (existing) return existing;

    const platformFee = this.calculatePlatformFee(amount);
    const creatorAmount = amount;
    return this.prisma.escrow.create({
      data: {
        campaign_id: application.campaign_id,
        brand_id: application.campaign.brand_id,
        creator_id: application.creator_id,
        amount,
        platform_fee_percent: PLATFORM_FEE_PERCENT,
        platform_fee_amount: platformFee,
        platform_fee: platformFee,
        creator_amount: creatorAmount,
        status: ESCROW_STATUSES.PENDING,
      },
    });
  }

  /** @deprecated Use createPendingEscrowOnApplicationAccept — kept for backward compatibility */
  async lockFundsOnApplicationAccept(application: {
    campaign_id: string;
    creator_id: string;
    proposed_price?: number | null;
    campaign: { brand_id: string; budget: number; title: string; brand: { user_id: string } };
    creator: { user_id: string };
  }) {
    return this.createPendingEscrowOnApplicationAccept(application);
  }

  private async fundPendingEscrow(
    escrowId: string,
    params: {
      brandUserId: string;
      creatorUserId: string;
      amount: number;
      campaignTitle: string;
    },
  ) {
    const escrow = await this.getEscrowWithRelations(escrowId);
    if (escrow.status !== ESCROW_STATUSES.PENDING) {
      throw new BadRequestException(`Cannot fund escrow in ${escrow.status} status`);
    }
    if (escrow.brand.user_id !== params.brandUserId) {
      throw new ForbiddenException('Only the brand can fund escrow');
    }

    const amount = params.amount;
    const breakdown = this.getBrandFundingBreakdown(amount);
    const brandWallet = await this.wallet.ensureWallet(params.brandUserId);
    if (brandWallet.available_balance < breakdown.brandTotal) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required ₹${breakdown.brandTotal.toLocaleString()} (₹${breakdown.creatorAmount} campaign + ₹${breakdown.platformFee} platform fee at ${breakdown.platformFeePercent}%)`,
      );
    }
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      await this.fundBrandEscrowFromWallet(tx, params.brandUserId, escrowId, breakdown);

      const updated = await tx.escrow.update({
        where: { id: escrowId },
        data: {
          amount,
          platform_fee_percent: breakdown.platformFeePercent,
          platform_fee_amount: breakdown.platformFee,
          platform_fee: breakdown.platformFee,
          creator_amount: breakdown.creatorAmount,
          status: ESCROW_STATUSES.HELD,
          locked_at: now,
          funded_at: now,
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

    await this.notifyEscrowHeld(result.escrow, params.brandUserId, params.creatorUserId, params.campaignTitle);
    emitWalletEvent(params.brandUserId, 'wallet:updated', this.wallet.formatWallet(result.brandWallet));
    emitWalletEvent(params.brandUserId, 'escrow:funded', result.escrow);
    emitWalletEvent(params.creatorUserId, 'escrow:funded', result.escrow);

    return result.escrow;
  }

  private async lockFundsForEscrow(params: {
    campaignId: string;
    brandId: string;
    brandUserId: string;
    creatorId: string;
    creatorUserId: string;
    amount: number;
    campaignTitle: string;
  }) {
    const breakdown = this.getBrandFundingBreakdown(params.amount);
    const brandWalletCheck = await this.wallet.ensureWallet(params.brandUserId);
    if (brandWalletCheck.available_balance < breakdown.brandTotal) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required ₹${breakdown.brandTotal.toLocaleString()} (₹${breakdown.creatorAmount} campaign + ₹${breakdown.platformFee} platform fee at ${breakdown.platformFeePercent}%)`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.create({
        data: {
          campaign_id: params.campaignId,
          brand_id: params.brandId,
          creator_id: params.creatorId,
          amount: params.amount,
          platform_fee: breakdown.platformFee,
          platform_fee_percent: breakdown.platformFeePercent,
          platform_fee_amount: breakdown.platformFee,
          creator_amount: breakdown.creatorAmount,
          status: ESCROW_STATUSES.PENDING,
        },
      });

      await this.fundBrandEscrowFromWallet(tx, params.brandUserId, escrow.id, breakdown);

      const held = await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          status: ESCROW_STATUSES.HELD,
          locked_at: new Date(),
          funded_at: new Date(),
        },
        include: {
          campaign: { select: { title: true } },
          brand: { include: { user: { select: { id: true, name: true } } } },
          creator: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      const brandWallet = await this.wallet.ensureWallet(params.brandUserId, tx);
      return { escrow: held, brandWallet };
    });

    await this.notifyEscrowHeld(result.escrow, params.brandUserId, params.creatorUserId, params.campaignTitle);
    emitWalletEvent(params.brandUserId, 'wallet:updated', result.brandWallet);
    emitWalletEvent(params.brandUserId, 'escrow:created', result.escrow);
    emitWalletEvent(params.creatorUserId, 'escrow:created', result.escrow);

    return result.escrow;
  }

  private async notifyEscrowHeld(
    escrow: { id: string; amount: number },
    brandUserId: string,
    creatorUserId: string,
    campaignTitle: string,
  ) {
    await Promise.all([
      this.notifications.create({
        userId: brandUserId,
        title: 'Escrow Secured',
        message: `₹${escrow.amount.toLocaleString()} locked in escrow for ${campaignTitle}.`,
        type: 'PAYMENT',
        entityType: 'Escrow',
        entityId: escrow.id,
      }),
      this.notifications.create({
        userId: creatorUserId,
        title: 'Escrow Secured',
        message: `₹${escrow.amount.toLocaleString()} is held in escrow for ${campaignTitle}. You can start work.`,
        type: 'PAYMENT',
        entityType: 'Escrow',
        entityId: escrow.id,
      }),
    ]);
  }

  async releaseEscrow(userId: string, escrowId: string, options?: { systemRelease?: boolean; reason?: string }) {
    const escrow = await this.getEscrowWithRelations(escrowId);
    if (!options?.systemRelease && escrow.brand.user_id !== userId) {
      throw new ForbiddenException('Only the brand can release escrow');
    }
    return this.releaseEscrowInternal(escrow, options?.reason);
  }

  async adminReleaseEscrow(escrowId: string, reason?: string) {
    const escrow = await this.getEscrowWithRelations(escrowId);
    return this.releaseEscrowInternal(escrow, reason ?? 'Released by admin');
  }

  async adminRefundEscrow(escrowId: string) {
    const escrow = await this.getEscrowWithRelations(escrowId);
    return this.refundEscrowInternal(escrow);
  }

  async releaseEscrowByCampaignCreator(campaignId: string, creatorId: string, reason?: string) {
    const escrow = await this.prisma.escrow.findFirst({
      where: { campaign_id: campaignId, creator_id: creatorId },
      include: {
        campaign: true,
        brand: { include: { user: true } },
        creator: { include: { user: true } },
      },
    });
    if (!escrow) throw new NotFoundException('Escrow not found for this campaign');
    return this.releaseEscrowInternal(escrow, reason);
  }

  private async releaseEscrowInternal(
    escrow: Awaited<ReturnType<EscrowService['getEscrowWithRelations']>>,
    reason?: string,
  ) {
    if (escrow.status === ESCROW_STATUSES.RELEASED) return escrow;
    if (escrow.status !== ESCROW_STATUSES.HELD && escrow.status !== ESCROW_STATUSES.DISPUTED) {
      throw new BadRequestException(`Cannot release escrow in ${escrow.status} status`);
    }

    const creatorPayout = this.resolveCreatorPayout(escrow);

    const result = await this.prisma.$transaction(async (tx) => {
      await this.wallet.releaseLocked(tx, escrow.brand.user_id, escrow.amount, escrow.id);

      const creatorResult = await this.wallet.creditCreatorPayout(
        tx,
        escrow.creator.user_id,
        creatorPayout,
        escrow.id,
      );

      const updated = await tx.escrow.update({
        where: { id: escrow.id },
        data: { status: ESCROW_STATUSES.RELEASED, released_at: new Date() },
        include: {
          campaign: { select: { title: true } },
          brand: { include: { user: { select: { id: true } } } },
          creator: { include: { user: { select: { id: true } } } },
        },
      });

      return { escrow: updated, creatorWallet: creatorResult.wallet, creatorPayout };
    });

    const releaseMessage = reason
      ? reason
      : `₹${result.creatorPayout.toLocaleString()} has been released to your wallet.`;

    await Promise.all([
      this.notifications.create({
        userId: escrow.creator.user_id,
        title: 'Payment Released',
        message: releaseMessage,
        type: 'PAYMENT',
        entityType: 'Escrow',
        entityId: escrow.id,
      }),
      this.notifications.create({
        userId: escrow.brand.user_id,
        title: 'Escrow Released',
        message: `Escrow of ₹${escrow.amount.toLocaleString()} was released to the creator.`,
        type: 'PAYMENT',
        entityType: 'Escrow',
        entityId: escrow.id,
      }),
    ]);

    emitWalletEvent(escrow.creator.user_id, 'wallet:updated', this.wallet.formatWallet(result.creatorWallet));
    emitWalletEvent(escrow.brand.user_id, 'escrow:released', result.escrow);
    emitWalletEvent(escrow.creator.user_id, 'escrow:released', result.escrow);

    return result.escrow;
  }

  async refundEscrow(userId: string, escrowId: string) {
    const escrow = await this.getEscrowWithRelations(escrowId);
    if (escrow.brand.user_id !== userId) throw new ForbiddenException('Only the brand can refund escrow');
    return this.refundEscrowInternal(escrow);
  }

  private async refundEscrowInternal(
    escrow: Awaited<ReturnType<EscrowService['getEscrowWithRelations']>>,
  ) {
    if (escrow.status === ESCROW_STATUSES.REFUNDED) return escrow;
    if (escrow.status !== ESCROW_STATUSES.HELD && escrow.status !== ESCROW_STATUSES.DISPUTED) {
      throw new BadRequestException(`Cannot refund escrow in ${escrow.status} status`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (escrow.status === ESCROW_STATUSES.HELD || escrow.status === ESCROW_STATUSES.DISPUTED) {
        await this.wallet.refundLockedToAvailable(tx, escrow.brand.user_id, escrow.amount, escrow.id);
      }
      const updated = await tx.escrow.update({
        where: { id: escrow.id },
        data: { status: ESCROW_STATUSES.REFUNDED, refunded_at: new Date() },
      });
      const brandWallet = await this.wallet.ensureWallet(escrow.brand.user_id, tx);
      return { escrow: updated, brandWallet };
    });

    await this.notifications.create({
      userId: escrow.brand.user_id,
      title: 'Escrow Refunded',
      message: `₹${escrow.amount.toLocaleString()} has been refunded to your wallet.`,
      type: 'PAYMENT',
      entityType: 'Escrow',
      entityId: escrow.id,
    });

    emitWalletEvent(escrow.brand.user_id, 'wallet:updated', this.wallet.formatWallet(result.brandWallet));
    return result.escrow;
  }

  async openDispute(userId: string, role: 'brand' | 'creator', dto: OpenDisputeDto) {
    if (role === 'brand') {
      return this.openBrandDispute(userId, dto);
    }
    return this.openCreatorDispute(userId, dto);
  }

  private async openBrandDispute(userId: string, dto: OpenDisputeDto) {
    if (!dto.creator_id) throw new BadRequestException('creator_id is required');
    const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
    if (!brand) throw new ForbiddenException('Brand profile required');

    const campaign = await this.prisma.campaign.findFirst({
      where: { id: dto.campaign_id, brand_id: brand.id },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.createDisputeRecord({
      campaignId: dto.campaign_id,
      creatorId: dto.creator_id,
      brandId: brand.id,
      reason: dto.reason,
      raisedBy: 'brand',
      campaignTitle: campaign.title,
      brandName: brand.company_name,
    });
  }

  private async openCreatorDispute(userId: string, dto: OpenDisputeDto) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');

    const campaign = await this.prisma.campaign.findUnique({ where: { id: dto.campaign_id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.createDisputeRecord({
      campaignId: dto.campaign_id,
      creatorId: creator.id,
      brandId: campaign.brand_id,
      reason: dto.reason,
      raisedBy: 'creator',
      campaignTitle: campaign.title,
      brandName: undefined,
      creatorName: creator.full_name ?? undefined,
    });
  }

  private async createDisputeRecord(params: {
    campaignId: string;
    creatorId: string;
    brandId: string;
    reason: string;
    raisedBy: 'brand' | 'creator';
    campaignTitle: string;
    brandName?: string;
    creatorName?: string;
  }) {
    const existing = await this.prisma.dispute.findFirst({
      where: {
        campaign_id: params.campaignId,
        creator_id: params.creatorId,
        status: { in: OPEN_DISPUTE_STATUSES },
      },
    });
    if (existing) throw new BadRequestException('An open dispute already exists for this campaign');

    const dispute = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dispute.create({
        data: {
          campaign_id: params.campaignId,
          creator_id: params.creatorId,
          brand_id: params.brandId,
          reason: params.reason,
          raised_by: params.raisedBy,
          status: DISPUTE_STATUSES.OPEN,
        },
        include: {
          campaign: { select: { title: true } },
          creator: { include: { user: { select: { id: true, name: true } } } },
          brand: { include: { user: { select: { id: true, name: true } } } },
        },
      });
      await tx.escrow.updateMany({
        where: {
          campaign_id: params.campaignId,
          creator_id: params.creatorId,
          brand_id: params.brandId,
          status: ESCROW_STATUSES.HELD,
        },
        data: { status: ESCROW_STATUSES.DISPUTED },
      });
      return created;
    });

    await this.notifications.notifyAdmins({
      title: 'Dispute Raised',
      message: `A dispute was opened on ${params.campaignTitle}.`,
      type: 'DISPUTE',
      entityType: 'Dispute',
      entityId: dispute.id,
    });

    const notifyIds = [dispute.creator.user_id, dispute.brand.user_id];
    await Promise.all(
      notifyIds.map((uid) =>
        this.notifications.create({
          userId: uid,
          title: 'Dispute Created',
          message: `A dispute was opened for ${params.campaignTitle}.`,
          type: 'DISPUTE',
          entityType: 'Dispute',
          entityId: dispute.id,
        }),
      ),
    );

    return this.formatDispute(dispute);
  }

  private async getEscrowWithRelations(escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        campaign: true,
        brand: { include: { user: true } },
        creator: { include: { user: true } },
      },
    });
    if (!escrow) throw new NotFoundException('Escrow not found');
    return escrow;
  }

  private assertEscrowAccess(userId: string, escrow: { brand: { user_id: string }; creator: { user_id: string } }) {
    if (escrow.brand.user_id !== userId && escrow.creator.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }

  formatEscrow(escrow: Record<string, unknown>) {
    const amount = Number(escrow.amount);
    const platformFee = Number(
      escrow.platform_fee_amount ?? escrow.platform_fee ?? this.calculatePlatformFee(amount),
    );
    return {
      id: escrow.id,
      campaignId: escrow.campaign_id,
      campaignTitle: (escrow.campaign as { title?: string })?.title,
      brandId: escrow.brand_id,
      creatorId: escrow.creator_id,
      amount,
      platformFee,
      platformFeePercent: Number(escrow.platform_fee_percent ?? PLATFORM_FEE_PERCENT),
      brandTotal: amount + platformFee,
      creatorPayout: amount,
      status: escrow.status,
      lockedAt: (escrow.locked_at as Date | null)?.toISOString?.() ?? escrow.locked_at ?? null,
      createdAt: (escrow.created_at as Date)?.toISOString?.() ?? escrow.created_at,
      releasedAt: (escrow.released_at as Date | null)?.toISOString?.() ?? escrow.released_at ?? null,
    };
  }

  formatDispute(row: {
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
    return {
      id: row.id,
      campaignId: row.campaign_id,
      campaignTitle: row.campaign?.title ?? '',
      creator: row.creator?.full_name ?? row.creator?.user?.name ?? 'Creator',
      brand: row.brand?.company_name ?? row.brand?.user?.name ?? 'Brand',
      reason: row.reason,
      raisedBy: row.raised_by,
      status: row.status.toLowerCase(),
      openedAt: row.created_at.toISOString(),
    };
  }
}
