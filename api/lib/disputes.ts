import type { PrismaClient } from '@prisma/client';
import { createNotification, notifyAdmins } from './notifications';

const OPEN_STATUSES = ['OPEN', 'ESCALATED'];

const disputeInclude = {
  campaign: { select: { id: true, title: true } },
  creator: { include: { user: { select: { id: true, name: true } } } },
  brand: { include: { user: { select: { id: true, name: true } } } },
} as const;

function encodeRaisedBy(reason: string, raisedBy: 'brand' | 'creator') {
  return `<!--raised_by:${raisedBy}-->${reason}`;
}

function decodeReason(reason: string, raisedByField?: string): { reason: string; raisedBy: 'brand' | 'creator' } {
  if (raisedByField === 'brand' || raisedByField === 'creator') {
    return { reason, raisedBy: raisedByField };
  }
  const match = reason.match(/^<!--raised_by:(brand|creator)-->/);
  if (!match) return { reason, raisedBy: 'brand' };
  return {
    raisedBy: match[1] as 'brand' | 'creator',
    reason: reason.replace(/^<!--raised_by:(brand|creator)-->/, ''),
  };
}

function normalizeStatusFilter(status?: string) {
  if (!status || status === 'all') return undefined;
  return status.toUpperCase();
}

function priorityFromAmount(amount: number): 'high' | 'medium' | 'low' {
  if (amount >= 10000) return 'high';
  if (amount >= 3000) return 'medium';
  return 'low';
}

async function findEscrow(
  prisma: PrismaClient,
  campaignId: string,
  creatorId: string,
  brandId: string,
) {
  return prisma.escrow.findFirst({
    where: { campaign_id: campaignId, creator_id: creatorId, brand_id: brandId },
    orderBy: { created_at: 'desc' },
    include: { creator: { select: { user_id: true } }, brand: { select: { user_id: true } } },
  });
}

async function formatDisputeRow(prisma: PrismaClient, row: {
  id: string;
  campaign_id: string;
  creator_id: string;
  brand_id: string;
  reason: string;
  raised_by?: string;
  status: string;
  created_at: Date;
  campaign?: { id: string; title: string } | null;
  creator?: { full_name?: string | null; user?: { name?: string | null } | null } | null;
  brand?: { company_name?: string | null; user?: { name?: string | null } | null } | null;
}) {
  const escrow = await findEscrow(prisma, row.campaign_id, row.creator_id, row.brand_id);
  const amount = escrow?.amount ?? 0;
  const { reason, raisedBy } = decodeReason(row.reason, row.raised_by);

  return {
    id: row.id,
    campaignId: row.campaign_id,
    campaignTitle: row.campaign?.title ?? '',
    creator: row.creator?.full_name ?? row.creator?.user?.name ?? 'Creator',
    brand: row.brand?.company_name ?? row.brand?.user?.name ?? 'Brand',
    reason,
    amount,
    status: row.status.toLowerCase(),
    openedAt: row.created_at.toISOString(),
    priority: priorityFromAmount(amount),
    raisedBy,
  };
}

export async function listAdminDisputes(
  prisma: PrismaClient,
  query: { status?: string; priority?: string; raised_by?: string; page?: number; limit?: number } = {},
) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, query.limit ?? 50);
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  const status = normalizeStatusFilter(query.status);
  if (status) where.status = status;

  const [rows, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: disputeInclude,
    }),
    prisma.dispute.count({ where }),
  ]);

  let data = await Promise.all(rows.map((row) => formatDisputeRow(prisma, row)));

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

export async function getAdminDisputeStats(prisma: PrismaClient) {
  const [openRows, resolvedCount] = await Promise.all([
    prisma.dispute.findMany({
      where: { status: { in: OPEN_STATUSES } },
      include: disputeInclude,
    }),
    prisma.dispute.count({ where: { status: { in: ['RESOLVED', 'REFUNDED'] } } }),
  ]);

  const formatted = await Promise.all(openRows.map((row) => formatDisputeRow(prisma, row)));
  const totalAtStake = formatted.reduce((sum, d) => sum + d.amount, 0);

  return {
    openCount: openRows.length,
    totalAtStake,
    resolvedCount,
  };
}

export async function getAdminDispute(prisma: PrismaClient, id: string) {
  const row = await prisma.dispute.findUnique({ where: { id }, include: disputeInclude });
  if (!row) return null;
  return formatDisputeRow(prisma, row);
}

async function getDisputeOrThrow(prisma: PrismaClient, id: string) {
  const row = await prisma.dispute.findUnique({ where: { id }, include: disputeInclude });
  if (!row) throw new Error('Dispute not found');
  return row;
}

async function creditWallet(
  tx: {
    wallet: PrismaClient['wallet'];
    walletTransaction: PrismaClient['walletTransaction'];
  },
  userId: string,
  amount: number,
  type: string,
  referenceId: string,
) {
  const wallet = await tx.wallet.upsert({
    where: { user_id: userId },
    update: {},
    create: { user_id: userId },
  });
  await tx.wallet.update({
    where: { id: wallet.id },
    data: { available_balance: { increment: amount } },
  });
  await tx.walletTransaction.create({
    data: {
      wallet_id: wallet.id,
      type,
      amount,
      status: 'COMPLETED',
      reference_type: 'Dispute',
      reference_id: referenceId,
    },
  });
}

async function settleEscrow(
  prisma: PrismaClient,
  dispute: { campaign_id: string; creator_id: string; brand_id: string; id: string },
  mode: 'release_creator' | 'refund_brand' | 'partial',
  partial?: { creatorAmount: number; brandAmount: number },
) {
  const escrow = await findEscrow(prisma, dispute.campaign_id, dispute.creator_id, dispute.brand_id);
  if (!escrow) return;

  await prisma.$transaction(async (tx) => {
    if (mode === 'release_creator') {
      await creditWallet(tx, escrow.creator.user_id, escrow.amount, 'ESCROW_RELEASE', escrow.id);
      await tx.escrow.update({ where: { id: escrow.id }, data: { status: 'RELEASED' } });
    } else if (mode === 'refund_brand') {
      await creditWallet(tx, escrow.brand.user_id, escrow.amount, 'ESCROW_REFUND', escrow.id);
      await tx.escrow.update({ where: { id: escrow.id }, data: { status: 'REFUNDED' } });
    } else if (mode === 'partial' && partial) {
      if (partial.creatorAmount > 0) {
        await creditWallet(tx, escrow.creator.user_id, partial.creatorAmount, 'ESCROW_RELEASE', escrow.id);
      }
      if (partial.brandAmount > 0) {
        await creditWallet(tx, escrow.brand.user_id, partial.brandAmount, 'ESCROW_REFUND', escrow.id);
      }
      await tx.escrow.update({ where: { id: escrow.id }, data: { status: 'RELEASED' } });
    }
  });
}

export async function updateAdminDispute(
  prisma: PrismaClient,
  id: string,
  action: 'escalate' | 'resolve' | 'refund' | 'partial',
  body?: { notes?: string; creatorAmount?: number; brandAmount?: number },
) {
  const dispute = await getDisputeOrThrow(prisma, id);

  if (action === 'escalate') {
    await prisma.dispute.update({ where: { id }, data: { status: 'ESCALATED' } });
  } else if (action === 'resolve') {
    await settleEscrow(prisma, dispute, 'release_creator');
    await prisma.dispute.update({ where: { id }, data: { status: 'RESOLVED' } });
  } else if (action === 'refund') {
    await settleEscrow(prisma, dispute, 'refund_brand');
    await prisma.dispute.update({ where: { id }, data: { status: 'REFUNDED' } });
  } else if (action === 'partial') {
    const creatorAmount = Number(body?.creatorAmount) || 0;
    const brandAmount = Number(body?.brandAmount) || 0;
    if (creatorAmount <= 0 && brandAmount <= 0) {
      throw new Error('creatorAmount or brandAmount is required for partial payout');
    }
    await settleEscrow(prisma, dispute, 'partial', { creatorAmount, brandAmount });
    await prisma.dispute.update({ where: { id }, data: { status: 'RESOLVED' } });
  }

  const updated = await getDisputeOrThrow(prisma, id);
  const formatted = await formatDisputeRow(prisma, updated);

  const notifyIds = [updated.creator?.user?.id, updated.brand?.user?.id].filter(Boolean) as string[];
  await Promise.all(
    notifyIds.map((userId) =>
      createNotification(prisma, {
        userId,
        title: 'Dispute Updated',
        message: `Dispute for ${formatted.campaignTitle} was ${action === 'escalate' ? 'escalated' : action + 'd'} by admin.`,
        type: 'DISPUTE',
        entityType: 'Dispute',
        entityId: id,
      }),
    ),
  );

  return formatted;
}

export async function openBrandDispute(
  prisma: PrismaClient,
  userId: string,
  body: { campaign_id: string; creator_id: string; reason: string },
) {
  const brand = await prisma.brandProfile.findUnique({ where: { user_id: userId } });
  if (!brand) throw new Error('Brand profile not found');

  const campaign = await prisma.campaign.findFirst({
    where: { id: body.campaign_id, brand_id: brand.id },
  });
  if (!campaign) throw new Error('Campaign not found');

  const creator = await prisma.creatorProfile.findUnique({ where: { id: body.creator_id } });
  if (!creator) throw new Error('Creator not found');

  const existing = await prisma.dispute.findFirst({
    where: {
      campaign_id: body.campaign_id,
      creator_id: body.creator_id,
      status: { in: OPEN_STATUSES },
    },
  });
  if (existing) throw new Error('An open dispute already exists for this campaign');

  const dispute = await prisma.$transaction(async (tx) => {
    const created = await tx.dispute.create({
      data: {
        campaign_id: body.campaign_id,
        creator_id: body.creator_id,
        brand_id: brand.id,
        reason: body.reason,
        raised_by: 'brand',
        status: 'OPEN',
      },
      include: disputeInclude,
    });
    await tx.escrow.updateMany({
      where: {
        campaign_id: body.campaign_id,
        creator_id: body.creator_id,
        brand_id: brand.id,
        status: 'HELD',
      },
      data: { status: 'DISPUTED' },
    });
    return created;
  });

  await notifyAdmins(prisma, {
    title: 'New Dispute Opened',
    message: `${brand.company_name ?? 'A brand'} opened a dispute on ${campaign.title}.`,
    type: 'DISPUTE',
    entityType: 'Dispute',
    entityId: dispute.id,
  });

  return formatDisputeRow(prisma, dispute);
}

export async function openCreatorDispute(
  prisma: PrismaClient,
  userId: string,
  body: { campaign_id: string; reason: string },
) {
  const creator = await prisma.creatorProfile.findUnique({ where: { user_id: userId } });
  if (!creator) throw new Error('Creator profile not found');

  const campaign = await prisma.campaign.findUnique({ where: { id: body.campaign_id } });
  if (!campaign) throw new Error('Campaign not found');

  const existing = await prisma.dispute.findFirst({
    where: {
      campaign_id: body.campaign_id,
      creator_id: creator.id,
      status: { in: OPEN_STATUSES },
    },
  });
  if (existing) throw new Error('An open dispute already exists for this campaign');

  const dispute = await prisma.$transaction(async (tx) => {
    const created = await tx.dispute.create({
      data: {
        campaign_id: body.campaign_id,
        creator_id: creator.id,
        brand_id: campaign.brand_id,
        reason: body.reason,
        raised_by: 'creator',
        status: 'OPEN',
      },
      include: disputeInclude,
    });
    await tx.escrow.updateMany({
      where: {
        campaign_id: body.campaign_id,
        creator_id: creator.id,
        brand_id: campaign.brand_id,
        status: 'HELD',
      },
      data: { status: 'DISPUTED' },
    });
    return created;
  });

  await notifyAdmins(prisma, {
    title: 'New Dispute Opened',
    message: `${creator.full_name ?? 'A creator'} opened a dispute on ${campaign.title}.`,
    type: 'DISPUTE',
    entityType: 'Dispute',
    entityId: dispute.id,
  });

  return formatDisputeRow(prisma, dispute);
}

export async function listUserDisputes(
  prisma: PrismaClient,
  userId: string,
  role: 'brand' | 'creator',
) {
  let where: Record<string, unknown> = {};
  if (role === 'brand') {
    const brand = await prisma.brandProfile.findUnique({ where: { user_id: userId } });
    if (!brand) return [];
    where = { brand_id: brand.id };
  } else {
    const creator = await prisma.creatorProfile.findUnique({ where: { user_id: userId } });
    if (!creator) return [];
    where = { creator_id: creator.id };
  }

  const rows = await prisma.dispute.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: disputeInclude,
  });
  return Promise.all(rows.map((row) => formatDisputeRow(prisma, row)));
}

export async function listUserEscrows(
  prisma: PrismaClient,
  userId: string,
  role: 'brand' | 'creator',
) {
  let escrows;
  if (role === 'brand') {
    const brand = await prisma.brandProfile.findUnique({ where: { user_id: userId } });
    if (!brand) return [];
    escrows = await prisma.escrow.findMany({
      where: { brand_id: brand.id },
      include: {
        campaign: { select: { title: true } },
        creator: { include: { user: { select: { name: true } } } },
      },
      orderBy: { created_at: 'desc' },
    });
    return Promise.all(
      escrows.map(async (e) => {
        const openDispute = await prisma.dispute.findFirst({
          where: {
            campaign_id: e.campaign_id,
            creator_id: e.creator_id,
            status: { in: OPEN_STATUSES },
          },
        });
        return {
          id: e.id,
          campaignId: e.campaign_id,
          campaignTitle: e.campaign.title,
          creatorId: e.creator_id,
          creatorName: e.creator.full_name ?? e.creator.user?.name ?? 'Creator',
          amount: e.amount,
          status: e.status,
          hasOpenDispute: Boolean(openDispute),
          canDispute: e.status === 'HELD' && !openDispute,
          createdAt: e.created_at.toISOString(),
        };
      }),
    );
  }

  const creator = await prisma.creatorProfile.findUnique({ where: { user_id: userId } });
  if (!creator) return [];
  escrows = await prisma.escrow.findMany({
    where: { creator_id: creator.id },
    include: {
      campaign: { select: { title: true } },
      brand: { include: { user: { select: { name: true } } } },
    },
    orderBy: { created_at: 'desc' },
  });
  return Promise.all(
    escrows.map(async (e) => {
      const openDispute = await prisma.dispute.findFirst({
        where: {
          campaign_id: e.campaign_id,
          creator_id: e.creator_id,
          status: { in: OPEN_STATUSES },
        },
      });
      return {
        id: e.id,
        campaignId: e.campaign_id,
        campaignTitle: e.campaign.title,
        brandName: e.brand.company_name ?? e.brand.user?.name ?? 'Brand',
        amount: e.amount,
        status: e.status,
        hasOpenDispute: Boolean(openDispute),
        canDispute: e.status === 'HELD' && !openDispute,
        createdAt: e.created_at.toISOString(),
      };
    }),
  );
}
