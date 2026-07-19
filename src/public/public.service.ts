import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginationMeta } from '../common/dto/pagination-query.dto';
import { PublicCampaignsQueryDto, PublicCreatorsQueryDto } from './public.dto';

const NICHE_STYLES: Record<string, { bg: string; color: string }> = {
  'Beauty & Skincare': { bg: '#FFF0F6', color: '#F357A8' },
  'Fitness & Health': { bg: '#EFEAFF', color: '#7B2FF7' },
  'Food & Cooking': { bg: '#FFF8EC', color: '#F9A826' },
  'Fashion & Style': { bg: '#FFF0F6', color: '#F357A8' },
  'Travel & Adventure': { bg: '#FFF8EC', color: '#F9A826' },
  'Tech & Gadgets': { bg: '#F0F8FF', color: '#1DA1F2' },
  Gaming: { bg: '#EFEAFF', color: '#7B2FF7' },
  Lifestyle: { bg: '#F0FFF4', color: '#22C55E' },
  Education: { bg: '#F0F8FF', color: '#1DA1F2' },
  Finance: { bg: '#F0FFF4', color: '#22C55E' },
  Parenting: { bg: '#FFF0F6', color: '#F357A8' },
  'Home & Decor': { bg: '#FFF8EC', color: '#F9A826' },
  Pets: { bg: '#F0F8FF', color: '#1DA1F2' },
  Wellness: { bg: '#EFEAFF', color: '#7B2FF7' },
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function formatCurrency(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

function buildUsername(name: string, email: string, id: string): string {
  const fromName = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 30);
  if (fromName.length >= 3) return fromName;
  const fromEmail = email.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 30) ?? '';
  if (fromEmail.length >= 3) return fromEmail;
  return id.replace(/-/g, '').slice(0, 12);
}

function getPrimaryPlatform(socialLinks: Record<string, string> | null | undefined): string {
  const links = socialLinks ?? {};
  if (links.instagram) return 'Instagram';
  if (links.youtube) return 'YouTube';
  if (links.tiktok) return 'TikTok';
  if (links.twitter || links.x) return 'Twitter/X';
  if (links.pinterest) return 'Pinterest';
  if (links.linkedin) return 'LinkedIn';
  return 'Instagram';
}

function getNicheStyle(niche: string | null | undefined) {
  return NICHE_STYLES[niche ?? ''] ?? { bg: '#F2F3F7', color: '#6B6B8A' };
}

function getBrandInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getCampaignStatus(applicants: number, deadline: Date): { status: string; color: string; bg: string } {
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 7) return { status: 'Closing Soon', color: '#F9A826', bg: '#FFF8EC' };
  if (applicants >= 100) return { status: 'Hot', color: '#F357A8', bg: '#FFF0F6' };
  return { status: 'Open', color: '#7B2FF7', bg: '#EFEAFF' };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async listCreators(query: PublicCreatorsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = {
      user: { status: 'ACTIVE', is_deleted: false, is_banned: false },
    };

    if (query.search) {
      where.OR = [
        { full_name: { contains: query.search, mode: 'insensitive' } },
        { niche: { contains: query.search, mode: 'insensitive' } },
        { bio: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const categoryList = query.categories
      ? query.categories.split(',').map((c) => c.trim()).filter(Boolean)
      : query.niche
        ? [query.niche]
        : [];

    if (categoryList.length === 1) {
      where.niche = { contains: categoryList[0], mode: 'insensitive' };
    } else if (categoryList.length > 1) {
      where.OR = [
        ...(where.OR ?? []),
        ...categoryList.map((cat) => ({ niche: { contains: cat, mode: 'insensitive' } })),
      ];
    }

    if (query.locality) where.locality = { contains: query.locality, mode: 'insensitive' };
    if (query.language) where.languages = { has: query.language };
    if (query.followersMin != null || query.followersMax != null) {
      where.followers = {
        ...(query.followersMin != null ? { gte: query.followersMin } : {}),
        ...(query.followersMax != null ? { lte: query.followersMax } : {}),
      };
    }
    if (query.engagementMin) where.engagement_rate = { gte: query.engagementMin };

    const orderBy =
      query.sort === 'followers' || query.sort === 'followers_desc'
        ? { followers: 'desc' as const }
        : query.sort === 'engagement' || query.sort === 'engagement_desc'
          ? { engagement_rate: 'desc' as const }
          : query.sort === 'deals_desc'
            ? { applications: { _count: 'desc' as const } }
            : { updated_at: 'desc' as const };

    const [rows, totalBeforePlatform] = await Promise.all([
      this.prisma.creatorProfile.findMany({
        where,
        include: {
          user: true,
          _count: { select: { applications: { where: { status: { in: ['COMPLETED', 'ACCEPTED'] } } } } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.creatorProfile.count({ where }),
    ]);

    let data = rows.map((row) => this.formatCreatorListItem(row));
    let total = totalBeforePlatform;

    if (query.platform) {
      const platformKey = query.platform.toLowerCase();
      data = data.filter((item) => item.platform.toLowerCase().includes(platformKey));
      total = data.length;
    }

    return { data, meta: paginationMeta(page, limit, total) };
  }

  async getCreatorByUsername(username: string) {
    const normalized = username.toLowerCase().replace(/^@/, '');

    if (isUuid(normalized)) {
      const byId = await this.prisma.creatorProfile.findFirst({
        where: { id: normalized, user: { status: 'ACTIVE', is_deleted: false, is_banned: false } },
        include: this.creatorDetailInclude(),
      });
      if (byId) return this.formatCreatorDetail(byId);
    }

    const creators = await this.prisma.creatorProfile.findMany({
      where: { user: { status: 'ACTIVE', is_deleted: false, is_banned: false } },
      include: this.creatorDetailInclude(),
    });

    const match = creators.find((row) => buildUsername(row.user.name, row.user.email, row.id) === normalized);
    if (!match) throw new NotFoundException('Creator not found');
    return this.formatCreatorDetail(match);
  }

  async listCampaigns(query: PublicCampaignsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { status: 'ACTIVE' };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { brand: { company_name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.platform) where.platform = { equals: query.platform, mode: 'insensitive' };
    if (query.locality) where.locality = { contains: query.locality, mode: 'insensitive' };
    if (query.language) where.languages = { has: query.language };

    const categoryList = query.categories
      ? query.categories.split(',').map((c) => c.trim()).filter(Boolean)
      : query.category
        ? [query.category]
        : [];

    if (categoryList.length === 1) {
      where.brand = { industry: { contains: categoryList[0], mode: 'insensitive' } };
    } else if (categoryList.length > 1) {
      where.OR = [
        ...(where.OR ?? []),
        ...categoryList.map((cat) => ({ brand: { industry: { contains: cat, mode: 'insensitive' } } })),
      ];
    }

    if (query.budgetMin != null || query.budgetMax != null) {
      where.budget = {
        ...(query.budgetMin != null ? { gte: query.budgetMin } : {}),
        ...(query.budgetMax != null ? { lte: query.budgetMax } : {}),
      };
    }

    if (query.deadlineDays) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + query.deadlineDays);
      where.deadline = { lte: maxDate };
    }

    const orderBy =
      query.sort === 'budget_desc' || query.sort === 'budget_high'
        ? { budget: 'desc' as const }
        : query.sort === 'budget_asc' || query.sort === 'budget_low'
          ? { budget: 'asc' as const }
          : query.sort === 'deadline' || query.sort === 'deadline_asc'
            ? { deadline: 'asc' as const }
            : query.sort === 'popular'
              ? { applications: { _count: 'desc' as const } }
              : { created_at: 'desc' as const };

    const [rows, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: {
          brand: { include: { user: true } },
          _count: { select: { applications: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.formatCampaignListItem(row)),
      meta: paginationMeta(page, limit, total),
    };
  }

  async getCampaignById(id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: {
        brand: { include: { user: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return this.formatCampaignDetail(campaign);
  }

  async getPlatformStats() {
    const [
      verifiedCreators,
      activeBrands,
      liveCampaigns,
      campaignsCompleted,
      premiumMembers,
    ] = await Promise.all([
      this.prisma.creatorProfile.count({
        where: { user: { is_verified: true, status: 'ACTIVE', is_deleted: false } },
      }),
      this.prisma.brandProfile.count({
        where: { user: { status: 'ACTIVE', is_deleted: false } },
      }),
      this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      this.prisma.application.count({ where: { status: 'COMPLETED' } }),
      this.prisma.user.count({ where: { is_verified: true, status: 'ACTIVE', is_deleted: false } }),
    ]);

    const localities = await this.prisma.creatorProfile.findMany({
      where: { locality: { not: null } },
      select: { locality: true },
      distinct: ['locality'],
    });

    const languages = await this.prisma.creatorProfile.findMany({
      select: { languages: true },
    });
    const uniqueLanguages = new Set(languages.flatMap((row) => row.languages));

    const payoutAgg = await this.prisma.walletTransaction.aggregate({
      where: { type: 'CREDIT', status: 'COMPLETED' },
      _sum: { amount: true },
    });

    return {
      verifiedCreators,
      activeBrands,
      liveCampaigns,
      campaignsCompleted,
      totalPayouts: payoutAgg._sum.amount ?? 0,
      citiesCovered: localities.length,
      languagesSupported: uniqueLanguages.size,
      premiumMembers,
    };
  }

  private creatorDetailInclude() {
    return {
      user: true,
      applications: {
        where: { status: { in: ['COMPLETED', 'ACCEPTED'] } },
        include: { campaign: { include: { brand: true } } },
        orderBy: { updated_at: 'desc' as const },
        take: 6,
      },
      _count: { select: { applications: { where: { status: 'COMPLETED' } } } },
    };
  }

  private formatCreatorListItem(row: any) {
    const name = row.full_name || row.user.name;
    const username = buildUsername(row.user.name, row.user.email, row.id);
    const niche = row.niche || 'Lifestyle';
    const nicheStyle = getNicheStyle(niche);
    const platform = getPrimaryPlatform(row.social_links as Record<string, string>);
    const completedDeals = row._count?.applications ?? 0;

    return {
      id: row.id,
      name,
      username,
      handle: `@${username}`,
      niche,
      platform,
      followers: row.followers,
      followersDisplay: formatFollowers(row.followers),
      engagement: row.engagement_rate,
      engagementDisplay: `${row.engagement_rate.toFixed(1)}%`,
      avgRate: 0,
      avgRateDisplay: 'Contact for rate',
      responseRate: 90,
      completedDeals,
      rating: 4.8,
      avatar: row.photo || row.user.avatar || '',
      alt: `${name} profile photo`,
      verified: row.user.is_verified,
      premium: false,
      nicheBg: nicheStyle.bg,
      nicheColor: nicheStyle.color,
      platformColor: '#7B2FF7',
      bio: row.bio || '',
      tags: niche.split(/[,/&]+/).map((t: string) => t.trim()).filter(Boolean).slice(0, 3),
      languages: row.languages ?? [],
      location: row.locality || '',
    };
  }

  private formatCreatorDetail(row: any) {
    const base = this.formatCreatorListItem(row);
    const socialLinks = (row.social_links as Record<string, string>) ?? {};
    const brandsWorkedWith = [
      ...new Set(
        row.applications?.map((app: any) => app.campaign?.brand?.company_name).filter(Boolean) ?? [],
      ),
    ];

    return {
      ...base,
      coverImage: '',
      portfolio: row.portfolio || '',
      mediaKit: row.media_kit || '',
      socialLinks,
      brandsWorkedWith,
      recentCampaigns:
        row.applications?.map((app: any) => ({
          id: app.campaign?.id,
          title: app.campaign?.title,
          brand: app.campaign?.brand?.company_name,
          status: app.status,
        })) ?? [],
      reviews: [],
    };
  }

  private formatCampaignListItem(row: any) {
    const brandName = row.brand.company_name;
    const brandStyle = getNicheStyle(row.brand.industry);
    const applicants = row._count?.applications ?? 0;
    const statusInfo = getCampaignStatus(applicants, new Date(row.deadline));
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(row.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    return {
      id: row.id,
      brand: brandName,
      brandInitial: getBrandInitial(brandName),
      brandColor: brandStyle.color,
      brandBg: brandStyle.bg,
      brandLogo: row.brand.logo || '',
      title: row.title,
      description: row.description,
      budgetMin: row.budget * 0.8,
      budgetMax: row.budget,
      budget: row.budget,
      budgetLabel: formatCurrency(row.budget),
      platform: row.platform,
      category: row.brand.industry || 'General',
      deadlineDays: daysLeft,
      deadline: row.deadline,
      deadlineLabel: new Date(row.deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      deliverables: Array.isArray(row.deliverables) ? row.deliverables.join(' + ') : '',
      deliverablesList: row.deliverables ?? [],
      applicants,
      languages: row.languages ?? [],
      location: row.locality || row.brand.location || '',
      status: statusInfo.status,
      statusColor: statusInfo.color,
      statusBg: statusInfo.bg,
    };
  }

  private formatCampaignDetail(row: any) {
    const base = this.formatCampaignListItem(row);
    return {
      ...base,
      creatorRequirements: (row.metadata as Record<string, unknown>)?.requirements ?? '',
      skills: (row.metadata as Record<string, unknown>)?.skills ?? [],
    };
  }
}
