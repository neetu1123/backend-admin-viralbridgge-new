import type { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createNotification } from './notifications';

const PLATFORMS = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK', 'LINKEDIN'] as const;
const CAMPAIGN_STATUSES = ['DRAFT', 'ACTIVE', 'PENDING_APPROVAL'] as const;

export type AdminCampaignBody = Record<string, unknown>;

function normalizePlatform(platform: unknown) {
  const p = String(platform ?? 'INSTAGRAM').toUpperCase();
  if (!PLATFORMS.includes(p as (typeof PLATFORMS)[number])) {
    throw new Error(`Invalid platform. Allowed: ${PLATFORMS.join(', ')}`);
  }
  return p;
}

function normalizeStatus(status: unknown) {
  const s = String(status ?? 'DRAFT').toUpperCase();
  if (!CAMPAIGN_STATUSES.includes(s as (typeof CAMPAIGN_STATUSES)[number])) {
    throw new Error(`Invalid status. Allowed: ${CAMPAIGN_STATUSES.join(', ')}`);
  }
  return s;
}

function parseDeadline(body: AdminCampaignBody) {
  const raw =
    body.applicationDeadline ?? body.application_deadline ?? body.endDate ?? body.end_date ?? body.startDate ?? body.start_date;
  if (!raw) throw new Error('applicationDeadline or endDate is required');
  const date = new Date(String(raw));
  if (Number.isNaN(date.getTime())) throw new Error('Invalid deadline date');
  return date;
}

function parseLocality(body: AdminCampaignBody) {
  const loc = body.locality;
  if (Array.isArray(loc)) return loc.map(String).join(', ');
  if (typeof loc === 'string') return loc;
  return undefined;
}

function buildDeliverables(body: AdminCampaignBody) {
  const items: string[] = [];
  const posts = Number(body.numberOfPosts ?? body.number_of_posts) || 0;
  const reels = Number(body.numberOfReels ?? body.number_of_reels) || 0;
  const stories = Number(body.numberOfStories ?? body.number_of_stories) || 0;
  const videos = Number(body.numberOfVideos ?? body.number_of_videos) || 0;
  if (posts > 0) items.push(`${posts} Post${posts > 1 ? 's' : ''}`);
  if (reels > 0) items.push(`${reels} Reel${reels > 1 ? 's' : ''}`);
  if (stories > 0) items.push(`${stories} Stor${stories > 1 ? 'ies' : 'y'}`);
  if (videos > 0) items.push(`${videos} Video${videos > 1 ? 's' : ''}`);
  const custom = body.customDeliverables ?? body.custom_deliverables;
  if (Array.isArray(custom)) {
    custom.forEach((d) => {
      const s = String(d).trim();
      if (s) items.push(s);
    });
  }
  if (Array.isArray(body.deliverables)) {
    body.deliverables.forEach((d) => {
      const s = String(d).trim();
      if (s) items.push(s);
    });
  }
  return items.length > 0 ? items : ['Campaign content'];
}

function buildMetadata(body: AdminCampaignBody, adminId: string) {
  return {
    totalBudget: Number(body.totalBudget ?? body.total_budget ?? body.budget) || 0,
    creatorBudget: Number(body.creatorBudget ?? body.creator_budget) || 0,
    platformFee: Number(body.platformFee ?? body.platform_fee) || 0,
    minimumFollowers: Number(body.minimumFollowers ?? body.minimum_followers) || 0,
    maximumFollowers: Number(body.maximumFollowers ?? body.maximum_followers) || 0,
    minimumEngagementRate: Number(body.minimumEngagementRate ?? body.minimum_engagement_rate) || 0,
    numberOfPosts: Number(body.numberOfPosts ?? body.number_of_posts) || 0,
    numberOfReels: Number(body.numberOfReels ?? body.number_of_reels) || 0,
    numberOfStories: Number(body.numberOfStories ?? body.number_of_stories) || 0,
    numberOfVideos: Number(body.numberOfVideos ?? body.number_of_videos) || 0,
    customDeliverables: body.customDeliverables ?? body.custom_deliverables ?? [],
    startDate: body.startDate ?? body.start_date ?? null,
    endDate: body.endDate ?? body.end_date ?? null,
    applicationDeadline: body.applicationDeadline ?? body.application_deadline ?? null,
    campaignBrief: body.campaignBrief ?? body.campaign_brief ?? null,
    referenceFiles: body.referenceFiles ?? body.reference_files ?? [],
    brandAssets: body.brandAssets ?? body.brand_assets ?? [],
    createdByAdminId: adminId,
    enterpriseManaged: true,
  };
}

function resolveBudget(body: AdminCampaignBody) {
  const total = Number(body.totalBudget ?? body.total_budget ?? body.budget);
  if (!total || total <= 0) throw new Error('totalBudget must be greater than 0');
  return total;
}

async function getBrandRoleId(prisma: PrismaClient) {
  const role = await prisma.role.findUnique({ where: { name: 'BRAND' } });
  if (!role) throw new Error('BRAND role not found. Run database seed.');
  return role.id;
}

async function ensureBrandWallet(prisma: PrismaClient, userId: string) {
  return prisma.wallet.upsert({
    where: { user_id: userId },
    update: {},
    create: { user_id: userId },
  });
}

export async function listAdminBrands(
  prisma: PrismaClient,
  query: { search?: string; industry?: string; status?: string; verified?: string; page?: number; limit?: number } = {},
) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, query.limit ?? 20);
  const skip = (page - 1) * limit;

  const userWhere: Record<string, unknown> = { role: { name: 'BRAND' }, is_deleted: false };
  if (query.status) userWhere.status = query.status.toUpperCase();
  if (query.verified === 'true') userWhere.is_verified = true;
  if (query.verified === 'false') userWhere.is_verified = false;

  const where: Record<string, unknown> = { user: userWhere };
  if (query.industry) where.industry = { contains: query.industry, mode: 'insensitive' };
  if (query.search) {
    where.OR = [
      { company_name: { contains: query.search, mode: 'insensitive' } },
      { contact_email: { contains: query.search, mode: 'insensitive' } },
      { user: { name: { contains: query.search, mode: 'insensitive' } } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.brandProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { company_name: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true, status: true, is_verified: true } },
        _count: { select: { campaigns: true } },
      },
    }),
    prisma.brandProfile.count({ where }),
  ]);

  return {
    data: rows.map((b) => ({
      id: b.id,
      userId: b.user_id,
      companyName: b.company_name,
      contactPerson: b.user.name,
      email: b.contact_email ?? b.user.email,
      phone: b.phone,
      website: b.website,
      industry: b.industry,
      status: b.user.status,
      verified: b.user.is_verified,
      campaignCount: b._count.campaigns,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminBrandDetail(prisma: PrismaClient, brandId: string) {
  const brand = await prisma.brandProfile.findUnique({
    where: { id: brandId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          is_verified: true,
          created_at: true,
        },
      },
      campaigns: {
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { applications: true } } },
      },
    },
  });
  if (!brand) return null;

  const wallet = await prisma.wallet.findUnique({ where: { user_id: brand.user_id } });
  const brandKyc = await prisma.brandKyc.findUnique({ where: { user_id: brand.user_id } });
  const latestKyc = await prisma.kycRequest.findFirst({
    where: { user_id: brand.user_id },
    orderBy: { submitted_at: 'desc' },
  });

  const activeCampaigns = brand.campaigns.filter((c) => ['ACTIVE', 'PENDING_APPROVAL'].includes(c.status));
  const completedCampaigns = brand.campaigns.filter((c) => c.status === 'COMPLETED');

  return {
    profile: {
      id: brand.id,
      userId: brand.user_id,
      companyName: brand.company_name,
      contactPerson: brand.user.name,
      email: brand.contact_email ?? brand.user.email,
      phone: brand.phone,
      website: brand.website,
      industry: brand.industry,
      description: brand.description,
      location: brand.location,
      status: brand.user.status,
      verified: brand.user.is_verified,
      memberSince: brand.user.created_at,
    },
    wallet: wallet
      ? {
          availableBalance: wallet.available_balance,
          pendingBalance: wallet.pending_balance,
        }
      : { availableBalance: 0, pendingBalance: 0 },
    kycStatus: latestKyc?.status ?? brandKyc?.verification_status ?? 'UNVERIFIED',
    activeCampaigns: activeCampaigns.map(formatCampaignSummary),
    completedCampaigns: completedCampaigns.map(formatCampaignSummary),
    totalCampaigns: brand.campaigns.length,
  };
}

function formatCampaignSummary(c: {
  id: string;
  title: string;
  platform: string;
  budget: number;
  status: string;
  deadline: Date;
  created_at: Date;
  _count?: { applications: number };
}) {
  return {
    id: c.id,
    title: c.title,
    platform: c.platform,
    budget: c.budget,
    status: c.status,
    deadline: c.deadline,
    applicants: c._count?.applications ?? 0,
    createdAt: c.created_at,
  };
}

async function createCampaignRecord(
  prisma: PrismaClient,
  brandProfileId: string,
  adminId: string,
  body: AdminCampaignBody,
) {
  const budget = resolveBudget(body);
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  if (!title) throw new Error('title is required');
  if (!description) throw new Error('description is required');

  const languages = Array.isArray(body.languages)
    ? body.languages.map(String)
    : typeof body.languages === 'string'
      ? [body.languages]
      : ['English'];

  return prisma.campaign.create({
    data: {
      brand_id: brandProfileId,
      title,
      description,
      platform: normalizePlatform(body.platform),
      budget,
      remaining_budget: budget,
      deadline: parseDeadline(body),
      deliverables: buildDeliverables(body),
      locality: parseLocality(body),
      languages,
      status: normalizeStatus(body.status),
      created_by_admin_id: adminId,
      metadata: buildMetadata(body, adminId) as object,
    },
    include: {
      brand: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

async function postCampaignCreated(
  prisma: PrismaClient,
  adminId: string,
  campaign: {
    id: string;
    title: string;
    brand: { user_id: string; company_name: string };
  },
  brandUserId: string,
  auditFn: (data: { adminId: string; brandId: string; campaignId: string; metadata?: unknown }) => Promise<void>,
  options?: { invitationSent?: boolean; newBrand?: boolean },
) {
  await auditFn({
    adminId,
    brandId: campaign.brand.user_id,
    campaignId: campaign.id,
    metadata: { action: 'CREATE_CAMPAIGN_FOR_BRAND', ...options },
  });

  await createNotification(prisma, {
    userId: brandUserId,
    title: 'Campaign Created on Your Behalf',
    message: `Campaign "${campaign.title}" has been created by the ViralBridge Admin Team on your behalf.`,
    type: 'CAMPAIGN',
    entityType: 'Campaign',
    entityId: campaign.id,
  });

  await createNotification(prisma, {
    userId: adminId,
    title: 'Campaign Assigned to Brand',
    message: `Campaign "${campaign.title}" was successfully assigned to ${campaign.brand.company_name}.`,
    type: 'CAMPAIGN',
    entityType: 'Campaign',
    entityId: campaign.id,
  });
}

export async function createCampaignForBrand(
  prisma: PrismaClient,
  adminId: string,
  body: AdminCampaignBody,
  auditFn: (data: { adminId: string; brandId: string; campaignId: string; metadata?: unknown }) => Promise<void>,
) {
  const brandId = String(body.brandId ?? body.brand_id ?? '').trim();
  if (!brandId) throw new Error('brandId is required');

  const brand = await prisma.brandProfile.findUnique({
    where: { id: brandId },
    include: { user: true },
  });
  if (!brand) throw new Error('Brand not found');

  const campaign = await createCampaignRecord(prisma, brand.id, adminId, body);
  await postCampaignCreated(prisma, adminId, campaign, brand.user_id, auditFn);

  return {
    campaign,
    brand: { id: brand.id, companyName: brand.company_name, userId: brand.user_id },
  };
}

export async function createBrandAccount(
  prisma: PrismaClient,
  body: AdminCampaignBody,
) {
  const companyName = String(body.companyName ?? body.company_name ?? '').trim();
  const contactPerson = String(body.contactPerson ?? body.contact_person ?? companyName).trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const phone = body.phone ? String(body.phone) : undefined;
  const website = body.website ? String(body.website) : undefined;
  const industry = body.industry ? String(body.industry) : undefined;

  if (!companyName) throw new Error('companyName is required');
  if (!email) throw new Error('email is required');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('A user with this email already exists');

  const roleId = await getBrandRoleId(prisma);
  const tempPassword = String(body.password ?? `Vb@${Math.random().toString(36).slice(2, 10)}A1`);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      name: contactPerson,
      email,
      password: hashedPassword,
      role_id: roleId,
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  const brandProfile = await prisma.brandProfile.create({
    data: {
      user_id: user.id,
      company_name: companyName,
      industry,
      website,
      contact_email: email,
      phone,
    },
  });

  await ensureBrandWallet(prisma, user.id);

  return {
    user,
    brandProfile,
    tempPassword,
    invitationNote: `Brand account created. Temporary password: ${tempPassword} (share securely; email integration pending).`,
  };
}

export async function createCampaignWithBrand(
  prisma: PrismaClient,
  adminId: string,
  body: AdminCampaignBody,
  auditFn: (data: { adminId: string; brandId: string; campaignId: string; metadata?: unknown }) => Promise<void>,
) {
  const { user, brandProfile, tempPassword, invitationNote } = await createBrandAccount(prisma, body);
  const campaign = await createCampaignRecord(prisma, brandProfile.id, adminId, body);

  await postCampaignCreated(prisma, adminId, campaign, user.id, auditFn, {
    invitationSent: true,
    newBrand: true,
  });

  return {
    campaign,
    brand: {
      id: brandProfile.id,
      userId: user.id,
      companyName: brandProfile.company_name,
      email: user.email,
      tempPassword,
    },
    invitationNote,
  };
}

export { PLATFORMS, CAMPAIGN_STATUSES };
