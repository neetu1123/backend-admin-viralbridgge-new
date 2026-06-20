import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import { emitAnalyticsUpdate } from '../common/analytics-emitter';
import { formatMonthLabel, growthPercent, monthKey, resolveDateRange, type DateRange } from './analytics-date.util';
import type { AnalyticsQueryDto } from './analytics.dto';

@Injectable()
export class CreatorAnalyticsService {
  constructor(
    private prisma: PrismaService,
    private cache: AnalyticsCacheService,
  ) {}

  async getDashboard(userId: string, query: AnalyticsQueryDto) {
    return this.cached(`creator:dashboard:${userId}`, query, userId, async (range, profileId) => {
      const dateFilter = { gte: range.from, lte: range.to };

      const [
        totalEarningsAgg,
        pendingEarningsAgg,
        campaignsCompleted,
        totalApplications,
        acceptedApplications,
      ] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            wallet: { user_id: userId },
            type: 'ESCROW_RELEASE',
            status: 'COMPLETED',
            created_at: dateFilter,
          },
          _sum: { amount: true },
        }),
        this.prisma.escrow.aggregate({
          where: { creator_id: profileId, status: 'HELD' },
          _sum: { amount: true },
        }),
        this.prisma.application.count({
          where: { creator_id: profileId, status: 'COMPLETED', updated_at: dateFilter },
        }),
        this.prisma.application.count({
          where: { creator_id: profileId, created_at: dateFilter },
        }),
        this.prisma.application.count({
          where: {
            creator_id: profileId,
            status: { in: ['ACCEPTED', 'COMPLETED'] },
            created_at: dateFilter,
          },
        }),
      ]);

      const totalEarnings = totalEarningsAgg._sum.amount ?? 0;
      const pendingEarnings = pendingEarningsAgg._sum.amount ?? 0;
      const applicationSuccessRate =
        totalApplications > 0 ? Number(((acceptedApplications / totalApplications) * 100).toFixed(1)) : 0;

      return {
        period: range.period,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        kpis: {
          totalEarnings,
          pendingEarnings,
          campaignsCompleted,
          applicationSuccessRate,
          totalApplications,
          acceptedApplications,
        },
      };
    });
  }

  async getEarnings(userId: string, query: AnalyticsQueryDto) {
    return this.cached(`creator:earnings:${userId}`, query, userId, async (range, profileId) => {
      const releases = await this.prisma.transaction.findMany({
        where: {
          wallet: { user_id: userId },
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
          created_at: { gte: range.from, lte: range.to },
        },
        select: { amount: true, created_at: true },
        orderBy: { created_at: 'asc' },
      });

      const monthlyMap = new Map<string, number>();
      for (const row of releases) {
        const key = monthKey(row.created_at);
        monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + row.amount);
      }

      const monthlyEarningsTrend = [...monthlyMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, earnings]) => ({ month: formatMonthLabel(key), earnings, key }));

      const applications = await this.prisma.application.groupBy({
        by: ['status'],
        where: { creator_id: profileId, created_at: { gte: range.from, lte: range.to } },
        _count: { _all: true },
      });

      const funnelOrder = ['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
      const funnelMap = Object.fromEntries(applications.map((a) => [a.status, a._count._all]));
      const applicationFunnel = funnelOrder.map((status) => ({
        status,
        count: funnelMap[status] ?? 0,
      }));

      const appsWithCampaign = await this.prisma.application.findMany({
        where: { creator_id: profileId, created_at: { gte: range.from, lte: range.to } },
        select: { campaign: { select: { platform: true } } },
      });
      const platformCounts = new Map<string, number>();
      for (const app of appsWithCampaign) {
        const platform = app.campaign.platform || 'Other';
        platformCounts.set(platform, (platformCounts.get(platform) ?? 0) + 1);
      }
      const categoryBreakdown = [...platformCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return {
        period: range.period,
        monthlyEarningsTrend,
        applicationFunnel,
        categoryBreakdown,
      };
    });
  }

  async getProfilePerformance(userId: string, query: AnalyticsQueryDto) {
    return this.cached(`creator:profile:${userId}`, query, userId, async (range, profileId) => {
      const dateFilter = { gte: range.from, lte: range.to };

      const [messagesReceived, invitationsReceived, campaignOffers] = await Promise.all([
        this.prisma.message.count({
          where: {
            conversation: { creator_id: profileId },
            sender_id: { not: userId },
            created_at: dateFilter,
          },
        }),
        this.prisma.notification.count({
          where: {
            user_id: userId,
            type: 'CAMPAIGN',
            created_at: dateFilter,
          },
        }),
        this.prisma.application.count({
          where: { creator_id: profileId, created_at: dateFilter },
        }),
      ]);

      return {
        period: range.period,
        metrics: {
          profileViews: 0,
          profileViewsAvailable: false,
          invitationsReceived,
          messagesReceived,
          campaignOffers,
        },
      };
    });
  }

  async getTopBrands(userId: string, query: AnalyticsQueryDto) {
    return this.cached(`creator:top-brands:${userId}`, query, userId, async (range, profileId) => {
      const applications = await this.prisma.application.findMany({
        where: {
          creator_id: profileId,
          status: { in: ['ACCEPTED', 'COMPLETED'] },
          created_at: { gte: range.from, lte: range.to },
        },
        include: {
          campaign: { include: { brand: true } },
        },
      });

      const escrows = await this.prisma.escrow.findMany({
        where: {
          creator_id: profileId,
          status: 'RELEASED',
          released_at: { gte: range.from, lte: range.to },
        },
        select: { brand_id: true, amount: true },
      });

      const brandMap = new Map<string, { brandName: string; campaignCount: number; earnings: number }>();

      for (const app of applications) {
        const brandId = app.campaign.brand_id;
        const existing = brandMap.get(brandId) ?? {
          brandName: app.campaign.brand.company_name,
          campaignCount: 0,
          earnings: 0,
        };
        existing.campaignCount += 1;
        brandMap.set(brandId, existing);
      }

      for (const escrow of escrows) {
        const existing = brandMap.get(escrow.brand_id);
        if (existing) {
          existing.earnings += escrow.amount;
        }
      }

      const topBrands = [...brandMap.entries()]
        .map(([brandId, data]) => ({ brandId, ...data }))
        .sort((a, b) => b.earnings - a.earnings || b.campaignCount - a.campaignCount)
        .slice(0, 10);

      return { period: range.period, topBrands };
    });
  }

  private async cached<T>(
    prefix: string,
    query: AnalyticsQueryDto,
    userId: string,
    fn: (range: DateRange, profileId: string) => Promise<T>,
  ): Promise<T> {
    const range = resolveDateRange(query);
    const key = this.cache.cacheKey(prefix, {
      period: range.period,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    });

    const cached = await this.cache.get<T>(key);
    if (cached) return cached;

    const profile = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Creator profile not found');

    const result = await fn(range, profile.id);
    await this.cache.set(key, result);
    emitAnalyticsUpdate(userId, { type: 'analytics:update', scope: 'creator', cached: false });
    return result;
  }
}
