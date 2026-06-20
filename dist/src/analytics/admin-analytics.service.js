"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const analytics_cache_service_1 = require("./analytics-cache.service");
const analytics_emitter_1 = require("../common/analytics-emitter");
const analytics_constants_1 = require("./analytics.constants");
const analytics_date_util_1 = require("./analytics-date.util");
let AdminAnalyticsService = class AdminAnalyticsService {
    prisma;
    cache;
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    async getDashboard(userId, query) {
        return this.cached('admin:dashboard', query, userId, async (range) => {
            const [totalCreators, totalBrands, revenueAgg, escrowVolumeAgg] = await Promise.all([
                this.prisma.creatorProfile.count(),
                this.prisma.brandProfile.count(),
                this.prisma.transaction.aggregate({
                    where: {
                        type: { in: ['DEPOSIT', 'ESCROW_RELEASE'] },
                        status: 'COMPLETED',
                        created_at: { gte: range.from, lte: range.to },
                    },
                    _sum: { amount: true },
                }),
                this.prisma.escrow.aggregate({
                    where: { created_at: { gte: range.from, lte: range.to } },
                    _sum: { amount: true },
                }),
            ]);
            return {
                period: range.period,
                from: range.from.toISOString(),
                to: range.to.toISOString(),
                kpis: {
                    totalCreators,
                    totalBrands,
                    platformRevenue: revenueAgg._sum.amount ?? 0,
                    escrowVolume: escrowVolumeAgg._sum.amount ?? 0,
                },
            };
        });
    }
    async getUsers(userId, query) {
        return this.cached('admin:users', query, userId, async (range) => {
            const users = await this.prisma.user.findMany({
                where: { created_at: { gte: range.from, lte: range.to } },
                select: { created_at: true, role: { select: { name: true } } },
            });
            const monthlyMap = new Map();
            for (const user of users) {
                const key = (0, analytics_date_util_1.monthKey)(user.created_at);
                const bucket = monthlyMap.get(key) ?? { creators: 0, brands: 0, total: 0 };
                bucket.total += 1;
                const roleName = user.role?.name ?? '';
                if (roleName === 'CREATOR')
                    bucket.creators += 1;
                if (roleName === 'BRAND')
                    bucket.brands += 1;
                monthlyMap.set(key, bucket);
            }
            const userGrowth = [...monthlyMap.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, counts]) => ({
                month: (0, analytics_date_util_1.formatMonthLabel)(key),
                key,
                ...counts,
            }));
            const [newCreators, newBrands, prevCreators, prevBrands] = await Promise.all([
                this.prisma.user.count({
                    where: {
                        created_at: { gte: range.from, lte: range.to },
                        role: { name: 'CREATOR' },
                    },
                }),
                this.prisma.user.count({
                    where: {
                        created_at: { gte: range.from, lte: range.to },
                        role: { name: 'BRAND' },
                    },
                }),
                this.prisma.user.count({
                    where: {
                        created_at: { gte: range.previousFrom, lte: range.previousTo },
                        role: { name: 'CREATOR' },
                    },
                }),
                this.prisma.user.count({
                    where: {
                        created_at: { gte: range.previousFrom, lte: range.previousTo },
                        role: { name: 'BRAND' },
                    },
                }),
            ]);
            return {
                period: range.period,
                userGrowth,
                growthMetrics: {
                    newCreators,
                    newBrands,
                    creatorGrowthPercent: (0, analytics_date_util_1.growthPercent)(newCreators, prevCreators),
                    brandGrowthPercent: (0, analytics_date_util_1.growthPercent)(newBrands, prevBrands),
                },
            };
        });
    }
    async getRevenue(userId, query) {
        return this.cached('admin:revenue', query, userId, async (range) => {
            const transactions = await this.prisma.transaction.findMany({
                where: {
                    type: { in: ['DEPOSIT', 'ESCROW_RELEASE'] },
                    status: 'COMPLETED',
                    created_at: { gte: range.from, lte: range.to },
                },
                select: { amount: true, created_at: true, type: true },
                orderBy: { created_at: 'asc' },
            });
            const monthlyMap = new Map();
            for (const txn of transactions) {
                const key = (0, analytics_date_util_1.monthKey)(txn.created_at);
                monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + txn.amount);
            }
            const revenueGrowth = [...monthlyMap.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, revenue]) => ({ month: (0, analytics_date_util_1.formatMonthLabel)(key), revenue, key }));
            const current = transactions.reduce((sum, t) => sum + t.amount, 0);
            const previousTxns = await this.prisma.transaction.aggregate({
                where: {
                    type: { in: ['DEPOSIT', 'ESCROW_RELEASE'] },
                    status: 'COMPLETED',
                    created_at: { gte: range.previousFrom, lte: range.previousTo },
                },
                _sum: { amount: true },
            });
            const previous = previousTxns._sum.amount ?? 0;
            return {
                period: range.period,
                revenueGrowth,
                growthMetrics: {
                    totalRevenue: current,
                    revenueGrowthPercent: (0, analytics_date_util_1.growthPercent)(current, previous),
                },
            };
        });
    }
    async getCampaigns(userId, query) {
        return this.cached('admin:campaigns', query, userId, async (range) => {
            const statuses = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'FLAGGED', 'FROZEN'];
            const counts = await Promise.all(statuses.map((status) => this.prisma.campaign.count({
                where: { status, created_at: { gte: range.from, lte: range.to } },
            })));
            const campaignAnalytics = {
                created: counts.reduce((a, b) => a + b, 0),
                active: counts[statuses.indexOf('ACTIVE')] ?? 0,
                completed: counts[statuses.indexOf('COMPLETED')] ?? 0,
                flagged: counts[statuses.indexOf('FLAGGED')] ?? 0,
                draft: counts[statuses.indexOf('DRAFT')] ?? 0,
                pendingApproval: counts[statuses.indexOf('PENDING_APPROVAL')] ?? 0,
            };
            const campaigns = await this.prisma.campaign.findMany({
                where: { created_at: { gte: range.from, lte: range.to } },
                select: { created_at: true },
            });
            const monthlyMap = new Map();
            for (const c of campaigns) {
                const key = (0, analytics_date_util_1.monthKey)(c.created_at);
                monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
            }
            const campaignGrowth = [...monthlyMap.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, count]) => ({ month: (0, analytics_date_util_1.formatMonthLabel)(key), count, key }));
            const current = campaignAnalytics.created;
            const previous = await this.prisma.campaign.count({
                where: { created_at: { gte: range.previousFrom, lte: range.previousTo } },
            });
            return {
                period: range.period,
                campaignAnalytics,
                campaignGrowth,
                growthMetrics: {
                    campaignGrowthPercent: (0, analytics_date_util_1.growthPercent)(current, previous),
                },
            };
        });
    }
    async getKyc(userId, query) {
        return this.cached('admin:kyc', query, userId, async (range) => {
            const requests = await this.prisma.kycRequest.groupBy({
                by: ['status'],
                where: { submitted_at: { gte: range.from, lte: range.to } },
                _count: { _all: true },
            });
            const map = Object.fromEntries(requests.map((r) => [r.status, r._count._all]));
            return {
                period: range.period,
                kycAnalytics: {
                    verified: (map.APPROVED ?? 0) + (map.VERIFIED ?? 0),
                    pending: map.PENDING ?? 0,
                    rejected: (map.REJECTED ?? 0) + (map.DECLINED ?? 0),
                },
            };
        });
    }
    async getPlatforms(userId, query) {
        return this.cached('admin:platforms', query, userId, async (range) => {
            const campaigns = await this.prisma.campaign.findMany({
                where: { created_at: { gte: range.from, lte: range.to } },
                select: { platform: true, brand: { select: { industry: true } } },
            });
            const platformMap = new Map();
            const categoryMap = new Map();
            for (const campaign of campaigns) {
                const platform = this.normalizePlatform(campaign.platform);
                platformMap.set(platform, (platformMap.get(platform) ?? 0) + 1);
                const category = campaign.brand.industry?.trim() || 'Uncategorized';
                categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
            }
            const platformDistribution = [...platformMap.entries()]
                .map(([name, value]) => ({
                name,
                value,
                color: analytics_constants_1.PLATFORM_COLORS[name] ?? '#94a3b8',
            }))
                .sort((a, b) => b.value - a.value);
            const topCategories = [...categoryMap.entries()]
                .map(([name, count], index) => ({
                name,
                count,
                color: analytics_constants_1.CATEGORY_COLORS[index % analytics_constants_1.CATEGORY_COLORS.length],
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            return {
                period: range.period,
                platformDistribution,
                topCategories,
            };
        });
    }
    normalizePlatform(raw) {
        const value = raw.trim().toLowerCase();
        if (value.includes('instagram'))
            return 'Instagram';
        if (value.includes('youtube'))
            return 'YouTube';
        if (value.includes('tiktok'))
            return 'TikTok';
        if (value.includes('facebook'))
            return 'Facebook';
        if (value.includes('linkedin'))
            return 'LinkedIn';
        return raw.trim() || 'Other';
    }
    async cached(prefix, query, userId, fn) {
        const range = (0, analytics_date_util_1.resolveDateRange)(query);
        const key = this.cache.cacheKey(prefix, {
            period: range.period,
            from: range.from.toISOString(),
            to: range.to.toISOString(),
        });
        const cached = await this.cache.get(key);
        if (cached)
            return cached;
        const result = await fn(range);
        await this.cache.set(key, result);
        (0, analytics_emitter_1.emitAnalyticsUpdate)(userId, { type: 'analytics:update', scope: 'admin', cached: false });
        return result;
    }
};
exports.AdminAnalyticsService = AdminAnalyticsService;
exports.AdminAnalyticsService = AdminAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_cache_service_1.AnalyticsCacheService])
], AdminAnalyticsService);
//# sourceMappingURL=admin-analytics.service.js.map