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
  DISPUTE_STATUSES,
  ESCROW_STATUSES,
  OPEN_DISPUTE_STATUSES,
  TRANSACTION_TYPES,
} from './constants';
import { CreateEscrowDto, OpenDisputeDto } from './dto/escrow.dto';
import { WalletService } from './wallet.service';

@Injectable()
export class EscrowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly notifications: NotificationsService,
  ) {}

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
    if (existing) throw new BadRequestException('Escrow already exists for this campaign and creator');

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

  async lockFundsOnApplicationAccept(application: {
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

    return this.lockFundsForEscrow({
      campaignId: application.campaign_id,
      brandId: application.campaign.brand_id,
      brandUserId: application.campaign.brand.user_id,
      creatorId: application.creator_id,
      creatorUserId: application.creator.user_id,
      amount,
      campaignTitle: application.campaign.title,
    });
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
    const result = await this.prisma.$transaction(async (tx) => {
      await this.wallet.moveToPending(tx, params.brandUserId, params.amount);

      const escrow = await tx.escrow.create({
        data: {
          campaign_id: params.campaignId,
          brand_id: params.brandId,
          creator_id: params.creatorId,
          amount: params.amount,
          status: ESCROW_STATUSES.HELD,
        },
        include: {
          campaign: { select: { title: true } },
          brand: { include: { user: { select: { id: true, name: true } } } },
          creator: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      const brandWallet = await this.wallet.ensureWallet(params.brandUserId, tx);
      return { escrow, brandWallet };
    });

    await Promise.all([
      this.notifications.create({
        userId: params.brandUserId,
        title: 'Escrow Locked',
        message: `₹${params.amount.toLocaleString()} locked in escrow for ${params.campaignTitle}.`,
        type: 'PAYMENT',
        entityType: 'Escrow',
        entityId: result.escrow.id,
      }),
      this.notifications.create({
        userId: params.creatorUserId,
        title: 'Escrow Locked',
        message: `₹${params.amount.toLocaleString()} is held in escrow for ${params.campaignTitle}.`,
        type: 'PAYMENT',
        entityType: 'Escrow',
        entityId: result.escrow.id,
      }),
    ]);

    emitWalletEvent(params.brandUserId, 'wallet:updated', result.brandWallet);
    emitWalletEvent(params.brandUserId, 'escrow:created', result.escrow);
    emitWalletEvent(params.creatorUserId, 'escrow:created', result.escrow);

    return result.escrow;
  }

  async releaseEscrow(userId: string, escrowId: string) {
    const escrow = await this.getEscrowWithRelations(escrowId);
    if (escrow.brand.user_id !== userId) throw new ForbiddenException('Only the brand can release escrow');
    if (escrow.status === ESCROW_STATUSES.RELEASED) return escrow;
    if (escrow.status !== ESCROW_STATUSES.HELD && escrow.status !== ESCROW_STATUSES.DISPUTED) {
      throw new BadRequestException(`Cannot release escrow in ${escrow.status} status`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await this.wallet.releasePending(tx, escrow.brand.user_id, escrow.amount);

      const creatorWallet = await this.wallet.ensureWallet(escrow.creator.user_id, tx);
      await tx.wallet.update({
        where: { id: creatorWallet.id },
        data: { available_balance: { increment: escrow.amount } },
      });
      await tx.transaction.create({
        data: {
          wallet_id: creatorWallet.id,
          type: TRANSACTION_TYPES.ESCROW_RELEASE,
          amount: escrow.amount,
          status: 'COMPLETED',
          reference_id: escrow.id,
        },
      });

      const updated = await tx.escrow.update({
        where: { id: escrow.id },
        data: { status: ESCROW_STATUSES.RELEASED, released_at: new Date() },
        include: {
          campaign: { select: { title: true } },
          brand: { include: { user: { select: { id: true } } } },
          creator: { include: { user: { select: { id: true } } } },
        },
      });

      const refreshedCreatorWallet = await tx.wallet.findUnique({ where: { id: creatorWallet.id } });
      return { escrow: updated, creatorWallet: refreshedCreatorWallet };
    });

    await Promise.all([
      this.notifications.create({
        userId: escrow.creator.user_id,
        title: 'Escrow Released',
        message: `₹${escrow.amount.toLocaleString()} has been released to your wallet.`,
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

    emitWalletEvent(escrow.creator.user_id, 'wallet:updated', result.creatorWallet);
    emitWalletEvent(escrow.brand.user_id, 'escrow:released', result.escrow);
    emitWalletEvent(escrow.creator.user_id, 'escrow:released', result.escrow);

    return result.escrow;
  }

  async refundEscrow(userId: string, escrowId: string) {
    const escrow = await this.getEscrowWithRelations(escrowId);
    if (escrow.brand.user_id !== userId) throw new ForbiddenException('Only the brand can refund escrow');
    if (escrow.status === ESCROW_STATUSES.REFUNDED) return escrow;
    if (escrow.status !== ESCROW_STATUSES.HELD && escrow.status !== ESCROW_STATUSES.DISPUTED) {
      throw new BadRequestException(`Cannot refund escrow in ${escrow.status} status`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await this.wallet.refundPendingToAvailable(tx, escrow.brand.user_id, escrow.amount, escrow.id);
      const updated = await tx.escrow.update({
        where: { id: escrow.id },
        data: { status: ESCROW_STATUSES.REFUNDED, released_at: new Date() },
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

    emitWalletEvent(escrow.brand.user_id, 'wallet:updated', result.brandWallet);
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
      title: 'Dispute Created',
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

  private formatEscrow(escrow: Record<string, unknown>) {
    return {
      id: escrow.id,
      campaignId: escrow.campaign_id,
      campaignTitle: (escrow.campaign as { title?: string })?.title,
      brandId: escrow.brand_id,
      creatorId: escrow.creator_id,
      amount: escrow.amount,
      status: escrow.status,
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
