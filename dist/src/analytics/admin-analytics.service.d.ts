import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import type { AnalyticsQueryDto } from './analytics.dto';
export declare class AdminAnalyticsService {
    private prisma;
    private cache;
    constructor(prisma: PrismaService, cache: AnalyticsCacheService);
    getDashboard(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        from: string;
        to: string;
        kpis: {
            totalCreators: number;
            totalBrands: number;
            platformRevenue: number;
            escrowVolume: number;
        };
    }>;
    getUsers(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        userGrowth: {
            creators: number;
            brands: number;
            total: number;
            month: string;
            key: string;
        }[];
        growthMetrics: {
            newCreators: number;
            newBrands: number;
            creatorGrowthPercent: number;
            brandGrowthPercent: number;
        };
    }>;
    getRevenue(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        revenueGrowth: {
            month: string;
            revenue: number;
            key: string;
        }[];
        growthMetrics: {
            totalRevenue: number;
            revenueGrowthPercent: number;
        };
    }>;
    getCampaigns(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        campaignAnalytics: {
            created: number;
            active: number;
            completed: number;
            flagged: number;
            draft: number;
            pendingApproval: number;
        };
        campaignGrowth: {
            month: string;
            count: number;
            key: string;
        }[];
        growthMetrics: {
            campaignGrowthPercent: number;
        };
    }>;
    getKyc(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        kycAnalytics: {
            verified: number;
            pending: number;
            rejected: number;
        };
    }>;
    getPlatforms(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        platformDistribution: {
            name: string;
            value: number;
            color: string;
        }[];
        topCategories: {
            name: string;
            count: number;
            color: string;
        }[];
    }>;
    private normalizePlatform;
    private cached;
}
