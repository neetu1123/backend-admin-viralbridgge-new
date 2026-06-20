import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsCacheService } from './analytics-cache.service';
import type { AnalyticsQueryDto } from './analytics.dto';
export declare class CreatorAnalyticsService {
    private prisma;
    private cache;
    constructor(prisma: PrismaService, cache: AnalyticsCacheService);
    getDashboard(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        from: string;
        to: string;
        kpis: {
            totalEarnings: number;
            pendingEarnings: number;
            campaignsCompleted: number;
            applicationSuccessRate: number;
            totalApplications: number;
            acceptedApplications: number;
        };
    }>;
    getEarnings(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        monthlyEarningsTrend: {
            month: string;
            earnings: number;
            key: string;
        }[];
        applicationFunnel: {
            status: string;
            count: number;
        }[];
        categoryBreakdown: {
            name: string;
            count: number;
        }[];
    }>;
    getProfilePerformance(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        metrics: {
            profileViews: number;
            profileViewsAvailable: boolean;
            invitationsReceived: number;
            messagesReceived: number;
            campaignOffers: number;
        };
    }>;
    getTopBrands(userId: string, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        topBrands: {
            brandName: string;
            campaignCount: number;
            earnings: number;
            brandId: string;
        }[];
    }>;
    private cached;
}
