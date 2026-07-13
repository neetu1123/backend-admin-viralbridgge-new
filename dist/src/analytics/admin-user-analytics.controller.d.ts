import { AdminUserAnalyticsQueryDto } from '../analytics/admin-user-analytics.dto';
import { AdminUserAnalyticsService } from '../analytics/admin-user-analytics.service';
export declare class AdminUserAnalyticsController {
    private readonly adminUserAnalytics;
    constructor(adminUserAnalytics: AdminUserAnalyticsService);
    listUsers(query: AdminUserAnalyticsQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            role: string;
            status: string;
            campaignCount: number;
            walletBalance: number;
            totalEarnings: number;
            lastActive: any;
            joinedAt: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUser(userId: string): Promise<{
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
    getWallet(userId: string, query: AdminUserAnalyticsQueryDto): Promise<{
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
    getActivity(userId: string, query: AdminUserAnalyticsQueryDto): Promise<{
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
    getCampaigns(userId: string, query: AdminUserAnalyticsQueryDto): Promise<{
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
