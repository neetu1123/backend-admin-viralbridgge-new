import { AdminUserAnalyticsQueryDto } from './admin-user-analytics.dto';
import { AdminUserAnalyticsService } from './admin-user-analytics.service';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AnalyticsQueryDto } from './analytics.dto';
import { CreatorAnalyticsService } from './creator-analytics.service';
export declare class AnalyticsController {
    private readonly creatorAnalytics;
    private readonly adminAnalytics;
    private readonly adminUserAnalytics;
    constructor(creatorAnalytics: CreatorAnalyticsService, adminAnalytics: AdminAnalyticsService, adminUserAnalytics: AdminUserAnalyticsService);
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
    adminUserList(query: AdminUserAnalyticsQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            role: string;
            status: string;
            campaignCount: number;
            walletBalance: number;
            totalEarnings: number;
            lastActive: string | null;
            joinedAt: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    adminUserDetail(userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            joinedAt: string;
            verificationStatus: string;
            status: string;
        };
        campaignSummary: {
            created: number;
            active: number;
            completed: number;
            successRate: number;
        };
        walletSummary: {
            availableBalance: number;
            lockedBalance: number;
            lifetimeEarnings: number;
            pendingBalance: number;
        };
        activitySummary: {
            lastLogin: string | null;
            lastActive: string | null;
            lastCampaign: string | null;
            lastMessage: string | null;
            profileCompletion: number;
        };
        roleSpecific: {
            applicationsSubmitted: number;
            applicationsApproved: number;
            applicationsRejected: number;
            topBrands: {
                brandName: string;
                campaignCount: number;
            }[];
            campaignCategories: {
                name: string;
                count: number;
            }[];
            earningsTrend: {
                month: string;
                key: string;
                earnings: number;
            }[];
        } | {
            campaignSpend: number;
            creatorInvitations: number;
            applicationsReceived: number;
            topPerformingCampaigns: {
                id: string;
                status: string;
                title: string;
                budget: number;
            }[];
            campaignCompletionRate: number;
        } | null;
    }>;
    adminUserWallet(userId: string, query: AdminUserAnalyticsQueryDto): Promise<{
        availableBalance: number;
        lockedBalance: number;
        lifetimeEarnings: number;
        withdrawnAmount: number;
        pendingWithdrawals: number;
        transactions: {
            id: string;
            type: string;
            amount: number;
            status: string;
            createdAt: string;
        }[];
    }>;
    adminUserActivity(userId: string, query: AdminUserAnalyticsQueryDto): Promise<{
        lastLogin: string | null;
        lastActive: string | null;
        lastCampaign: string | null;
        lastMessage: string | null;
        periodTotals: {
            messages: number;
            campaigns: number;
            applications: number;
        };
        monthlyActivity: {
            campaigns: number;
            applications: number;
            messages: number;
            month: string;
            key: string;
        }[];
    }>;
    adminUserCampaigns(userId: string, query: AdminUserAnalyticsQueryDto): Promise<{
        campaigns: never[];
        summary: {
            created: number;
            active: number;
            completed: number;
            successRate: number;
            submitted?: undefined;
            approved?: undefined;
            rejected?: undefined;
        };
        monthlyGrowth?: undefined;
        applications?: undefined;
    } | {
        campaigns: {
            id: string;
            title: string;
            status: string;
            budget: number;
            createdAt: string;
        }[];
        summary: {
            created: number;
            active: number;
            completed: number;
            successRate: number;
            submitted?: undefined;
            approved?: undefined;
            rejected?: undefined;
        };
        monthlyGrowth: {
            month: string;
            key: string;
            count: number;
        }[];
        applications?: undefined;
    } | {
        applications: {
            id: string;
            campaignTitle: string;
            platform: string;
            status: string;
            proposedPrice: number | null;
            createdAt: string;
        }[];
        summary: {
            submitted: number;
            approved: number;
            rejected: number;
            created?: undefined;
            active?: undefined;
            completed?: undefined;
            successRate?: undefined;
        };
        campaigns?: undefined;
        monthlyGrowth?: undefined;
    }>;
}
