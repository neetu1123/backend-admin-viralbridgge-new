import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { formatMonthLabel, monthKey } from './analytics-date.util';
import type { AdminUserAnalyticsQueryDto } from './admin-user-analytics.dto';

@Injectable()
export class AdminUserAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async listUsers(query: AdminUserAnalyticsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      is_deleted: false,
      role: { name: { in: query.role ? [query.role] : ['CREATOR', 'BRAND'] } },
    };

    if (query.search?.trim()) {
      const term = query.search.trim();
      where['OR'] = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.from || query.to) {
      where['created_at'] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          role: true,
          wallets: { select: { available_balance: true, lifetime_earnings: true } },
          creator_profile: { include: { _count: { select: { applications: true } } } },
          brand_profile: { include: { _count: { select: { campaigns: true } } } },
          user_activity: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = users.map((u) => {
      const wallet = u.wallets[0];
      const roleName = u.role?.name ?? '';
      const campaignCount =
        roleName === 'BRAND'
          ? (u.brand_profile?._count.campaigns ?? 0)
          : (u.creator_profile?._count.applications ?? 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: roleName,
        status: u.is_banned ? 'BANNED' : u.status,
        campaignCount,
        walletBalance: wallet?.available_balance ?? 0,
        totalEarnings: wallet?.lifetime_earnings ?? 0,
        lastActive: u.user_activity?.last_active?.toISOString() ?? null,
        joinedAt: u.created_at.toISOString(),
      };
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        creator_profile: true,
        brand_profile: true,
        creator_kyc: true,
        brand_kyc: true,
        wallets: true,
        user_activity: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const roleName = user.role?.name ?? '';
    const wallet = user.wallets[0];
    const isCreator = roleName === 'CREATOR';
    const isBrand = roleName === 'BRAND';

    const [campaignSummary, roleSpecific] = await Promise.all([
      this.getCampaignSummary(user, isBrand),
      isCreator ? this.getCreatorMetrics(user.id) : isBrand ? this.getBrandMetrics(user.id) : null,
    ]);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        joinedAt: user.created_at.toISOString(),
        verificationStatus: isCreator
          ? (user.creator_kyc?.verification_status ?? 'UNVERIFIED')
          : (user.brand_kyc?.verification_status ?? 'UNVERIFIED'),
        status: user.is_banned ? 'BANNED' : user.status,
      },
      campaignSummary,
      walletSummary: {
        availableBalance: wallet?.available_balance ?? 0,
        lockedBalance: wallet?.locked_balance ?? 0,
        lifetimeEarnings: wallet?.lifetime_earnings ?? 0,
        pendingBalance: wallet?.pending_balance ?? 0,
      },
      activitySummary: {
        lastLogin: user.user_activity?.last_login?.toISOString() ?? null,
        lastActive: user.user_activity?.last_active?.toISOString() ?? null,
        lastCampaign: user.user_activity?.last_campaign_activity?.toISOString() ?? null,
        lastMessage: user.user_activity?.last_message_activity?.toISOString() ?? null,
        profileCompletion: this.calcProfileCompletion(user),
      },
      roleSpecific,
    };
  }

  async getUserWallet(userId: string, query: AdminUserAnalyticsQueryDto) {
    await this.ensureUser(userId);
    const wallet = await this.prisma.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet) {
      return {
        availableBalance: 0,
        lockedBalance: 0,
        lifetimeEarnings: 0,
        withdrawnAmount: 0,
        pendingWithdrawals: 0,
        transactions: [],
      };
    }

    const txWhere: Record<string, unknown> = { wallet_id: wallet.id };
    if (query.from || query.to) {
      txWhere['created_at'] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [transactions, withdrawnAgg, pendingWithdrawals] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: txWhere,
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
      this.prisma.walletTransaction.aggregate({
        where: { wallet_id: wallet.id, type: 'WITHDRAWAL', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.withdrawal.count({
        where: { creator: { user_id: userId }, status: 'PENDING' },
      }),
    ]);

    return {
      availableBalance: wallet.available_balance,
      lockedBalance: wallet.locked_balance,
      lifetimeEarnings: wallet.lifetime_earnings,
      withdrawnAmount: withdrawnAgg._sum.amount ?? 0,
      pendingWithdrawals,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        createdAt: t.created_at.toISOString(),
      })),
    };
  }

  async getUserActivity(userId: string, query: AdminUserAnalyticsQueryDto) {
    await this.ensureUser(userId);
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    const [activity, messages, brandProfile, creatorProfile] = await Promise.all([
      this.prisma.userActivity.findUnique({ where: { user_id: userId } }),
      this.prisma.message.findMany({
        where: { sender_id: userId, created_at: { gte: from, lte: to } },
        select: { created_at: true },
      }),
      this.prisma.brandProfile.findUnique({ where: { user_id: userId }, select: { id: true } }),
      this.prisma.creatorProfile.findUnique({ where: { user_id: userId }, select: { id: true } }),
    ]);

    const [campaigns, applications] = await Promise.all([
      brandProfile
        ? this.prisma.campaign.findMany({
            where: { brand_id: brandProfile.id, created_at: { gte: from, lte: to } },
            select: { created_at: true },
          })
        : Promise.resolve([]),
      creatorProfile
        ? this.prisma.application.findMany({
            where: { creator_id: creatorProfile.id, created_at: { gte: from, lte: to } },
            select: { created_at: true },
          })
        : Promise.resolve([]),
    ]);

    const monthlyMap = new Map<string, { campaigns: number; applications: number; messages: number }>();
    const addToMonth = (date: Date, field: 'campaigns' | 'applications' | 'messages') => {
      const key = monthKey(date);
      const bucket = monthlyMap.get(key) ?? { campaigns: 0, applications: 0, messages: 0 };
      bucket[field] += 1;
      monthlyMap.set(key, bucket);
    };

    for (const c of campaigns) addToMonth(c.created_at, 'campaigns');
    for (const a of applications) addToMonth(a.created_at, 'applications');
    for (const m of messages) addToMonth(m.created_at, 'messages');

    const monthlyActivity = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, counts]) => ({
        month: formatMonthLabel(key),
        key,
        ...counts,
      }));

    return {
      lastLogin: activity?.last_login?.toISOString() ?? null,
      lastActive: activity?.last_active?.toISOString() ?? null,
      lastCampaign: activity?.last_campaign_activity?.toISOString() ?? null,
      lastMessage: activity?.last_message_activity?.toISOString() ?? null,
      periodTotals: { messages: messages.length, campaigns: campaigns.length, applications: applications.length },
      monthlyActivity,
    };
  }

  async getUserCampaigns(userId: string, query: AdminUserAnalyticsQueryDto) {
    const user = await this.ensureUser(userId);
    const roleName = user.role?.name ?? '';
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const dateFilter = from || to ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } : undefined;

    if (roleName === 'BRAND') {
      const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
      if (!brand) return { campaigns: [], summary: { created: 0, active: 0, completed: 0, successRate: 0 } };

      const campaigns = await this.prisma.campaign.findMany({
        where: {
          brand_id: brand.id,
          ...(dateFilter ? { created_at: dateFilter } : {}),
        },
        orderBy: { created_at: 'desc' },
        take: query.limit ?? 50,
      });

      const [created, active, completed] = await Promise.all([
        this.prisma.campaign.count({ where: { brand_id: brand.id } }),
        this.prisma.campaign.count({ where: { brand_id: brand.id, status: 'ACTIVE' } }),
        this.prisma.campaign.count({ where: { brand_id: brand.id, status: 'COMPLETED' } }),
      ]);

      const monthlyGrowth = await this.buildCampaignGrowth(brand.id, 'brand');

      return {
        campaigns: campaigns.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          budget: c.budget,
          createdAt: c.created_at.toISOString(),
        })),
        summary: {
          created,
          active,
          completed,
          successRate: created > 0 ? Math.round((completed / created) * 1000) / 10 : 0,
        },
        monthlyGrowth,
      };
    }

    const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
    if (!creator) return { applications: [], summary: { submitted: 0, approved: 0, rejected: 0 } };

    const applications = await this.prisma.application.findMany({
      where: {
        creator_id: creator.id,
        ...(dateFilter ? { created_at: dateFilter } : {}),
      },
      include: { campaign: { select: { title: true, platform: true } } },
      orderBy: { created_at: 'desc' },
      take: query.limit ?? 50,
    });

    const [submitted, approved, rejected] = await Promise.all([
      this.prisma.application.count({ where: { creator_id: creator.id } }),
      this.prisma.application.count({ where: { creator_id: creator.id, status: 'ACCEPTED' } }),
      this.prisma.application.count({ where: { creator_id: creator.id, status: 'REJECTED' } }),
    ]);

    return {
      applications: applications.map((a) => ({
        id: a.id,
        campaignTitle: a.campaign.title,
        platform: a.campaign.platform,
        status: a.status,
        proposedPrice: a.proposed_price,
        createdAt: a.created_at.toISOString(),
      })),
      summary: { submitted, approved, rejected },
    };
  }

  private async getCampaignSummary(
    user: { id: string; brand_profile?: { id: string } | null },
    isBrand: boolean,
  ) {
    if (!isBrand || !user.brand_profile) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: user.id } });
      if (!creator) return { created: 0, active: 0, completed: 0, successRate: 0 };

      const [submitted, approved, completed] = await Promise.all([
        this.prisma.application.count({ where: { creator_id: creator.id } }),
        this.prisma.application.count({ where: { creator_id: creator.id, status: 'ACCEPTED' } }),
        this.prisma.application.count({ where: { creator_id: creator.id, status: 'COMPLETED' } }),
      ]);

      return {
        created: submitted,
        active: approved,
        completed,
        successRate: submitted > 0 ? Math.round((completed / submitted) * 1000) / 10 : 0,
      };
    }

    const brandId = user.brand_profile.id;
    const [created, active, completed] = await Promise.all([
      this.prisma.campaign.count({ where: { brand_id: brandId } }),
      this.prisma.campaign.count({ where: { brand_id: brandId, status: 'ACTIVE' } }),
      this.prisma.campaign.count({ where: { brand_id: brandId, status: 'COMPLETED' } }),
    ]);

    return {
      created,
      active,
      completed,
      successRate: created > 0 ? Math.round((completed / created) * 1000) / 10 : 0,
    };
  }

  private async getCreatorMetrics(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
    if (!creator) return null;

    const [submitted, approved, rejected, topBrands, categories] = await Promise.all([
      this.prisma.application.count({ where: { creator_id: creator.id } }),
      this.prisma.application.count({ where: { creator_id: creator.id, status: 'ACCEPTED' } }),
      this.prisma.application.count({ where: { creator_id: creator.id, status: 'REJECTED' } }),
      this.prisma.application.groupBy({
        by: ['campaign_id'],
        where: { creator_id: creator.id, status: { in: ['ACCEPTED', 'COMPLETED'] } },
        _count: { campaign_id: true },
        orderBy: { _count: { campaign_id: 'desc' } },
        take: 5,
      }),
      this.prisma.application.findMany({
        where: { creator_id: creator.id },
        include: { campaign: { select: { platform: true } } },
        take: 100,
      }),
    ]);

    const brandIds = topBrands.map((t) => t.campaign_id);
    const campaigns = await this.prisma.campaign.findMany({
      where: { id: { in: brandIds } },
      include: { brand: { select: { company_name: true } } },
    });
    const brandMap = new Map(campaigns.map((c) => [c.id, c.brand.company_name]));

    const categoryMap = new Map<string, number>();
    for (const app of categories) {
      const cat = app.campaign.platform || 'Other';
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
    }

    const earningsTrend = await this.getEarningsTrend(userId);

    return {
      applicationsSubmitted: submitted,
      applicationsApproved: approved,
      applicationsRejected: rejected,
      topBrands: topBrands.map((t) => ({
        brandName: brandMap.get(t.campaign_id) ?? 'Unknown',
        campaignCount: t._count.campaign_id,
      })),
      campaignCategories: [...categoryMap.entries()].map(([name, count]) => ({ name, count })),
      earningsTrend,
    };
  }

  private async getBrandMetrics(userId: string) {
    const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
    if (!brand) return null;

    const [campaignSpend, invitations, applicationsReceived, topCampaigns, completed, total] =
      await Promise.all([
        this.prisma.escrow.aggregate({
          where: { brand_id: brand.id, status: 'RELEASED' },
          _sum: { amount: true },
        }),
        this.prisma.aiMatch.count({ where: { campaign: { brand_id: brand.id } } }),
        this.prisma.application.count({ where: { campaign: { brand_id: brand.id } } }),
        this.prisma.campaign.findMany({
          where: { brand_id: brand.id },
          orderBy: { budget: 'desc' },
          take: 5,
          select: { id: true, title: true, budget: true, status: true },
        }),
        this.prisma.campaign.count({ where: { brand_id: brand.id, status: 'COMPLETED' } }),
        this.prisma.campaign.count({ where: { brand_id: brand.id } }),
      ]);

    return {
      campaignSpend: campaignSpend._sum.amount ?? 0,
      creatorInvitations: invitations,
      applicationsReceived,
      topPerformingCampaigns: topCampaigns,
      campaignCompletionRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
    };
  }

  private async getEarningsTrend(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet) return [];

    const txs = await this.prisma.walletTransaction.findMany({
      where: {
        wallet_id: wallet.id,
        type: { in: ['ESCROW_RELEASE', 'DEPOSIT'] },
        status: 'COMPLETED',
      },
      select: { amount: true, created_at: true },
      orderBy: { created_at: 'asc' },
    });

    const monthly = new Map<string, number>();
    for (const tx of txs) {
      const key = monthKey(tx.created_at);
      monthly.set(key, (monthly.get(key) ?? 0) + tx.amount);
    }

    return [...monthly.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, earnings]) => ({ month: formatMonthLabel(key), key, earnings }));
  }

  private async buildCampaignGrowth(profileId: string, type: 'brand') {
    const campaigns = await this.prisma.campaign.findMany({
      where: { brand_id: profileId },
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    const monthly = new Map<string, number>();
    for (const c of campaigns) {
      const key = monthKey(c.created_at);
      monthly.set(key, (monthly.get(key) ?? 0) + 1);
    }

    return [...monthly.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({ month: formatMonthLabel(key), key, count }));
  }

  private calcProfileCompletion(user: {
    role?: { name: string } | null;
    creator_profile?: {
      full_name?: string | null;
      bio?: string | null;
      niche?: string | null;
      photo?: string | null;
      social_links?: unknown;
    } | null;
    brand_profile?: {
      company_name?: string;
      industry?: string | null;
      logo?: string | null;
      description?: string | null;
    } | null;
  }) {
    const roleName = user.role?.name ?? '';
    if (roleName === 'CREATOR' && user.creator_profile) {
      const p = user.creator_profile;
      const fields = [p.full_name, p.bio, p.niche, p.photo, p.social_links];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    }
    if (roleName === 'BRAND' && user.brand_profile) {
      const p = user.brand_profile;
      const fields = [p.company_name, p.industry, p.logo, p.description];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    }
    return 0;
  }

  private async ensureUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
