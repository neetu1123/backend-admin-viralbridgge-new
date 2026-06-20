import { AdminAnalyticsService } from './admin-analytics.service';
import { AnalyticsQueryDto } from './analytics.dto';
import { CreatorAnalyticsService } from './creator-analytics.service';
export declare class AnalyticsController {
    private readonly creatorAnalytics;
    private readonly adminAnalytics;
    constructor(creatorAnalytics: CreatorAnalyticsService, adminAnalytics: AdminAnalyticsService);
    creatorDashboard(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
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
    creatorEarnings(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
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
    creatorProfilePerformance(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        metrics: {
            profileViews: number;
            profileViewsAvailable: boolean;
            invitationsReceived: number;
            messagesReceived: number;
            campaignOffers: number;
        };
    }>;
    creatorTopBrands(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        topBrands: {
            brandName: string;
            campaignCount: number;
            earnings: number;
            brandId: string;
        }[];
    }>;
    adminDashboard(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
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
    adminUsers(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
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
    adminRevenue(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
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
    adminCampaigns(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
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
    adminKyc(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
        period: "7d" | "30d" | "90d" | "1y" | "custom";
        kycAnalytics: {
            verified: number;
            pending: number;
            rejected: number;
        };
    }>;
    adminPlatforms(req: {
        user: {
            id: string;
        };
    }, query: AnalyticsQueryDto): Promise<{
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
}
