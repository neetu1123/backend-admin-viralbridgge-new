import { PrismaService } from '../prisma/prisma.service';
type CampaignWithBrand = {
    id: string;
    title: string;
    description: string;
    platform: string;
    budget: number;
    locality: string | null;
    languages: string[];
    brand?: {
        industry: string | null;
        company_name: string;
    } | null;
};
type CreatorProfile = {
    id: string;
    full_name: string | null;
    niche: string | null;
    followers: number;
    engagement_rate: number;
    languages: string[];
    locality: string | null;
    user?: {
        name: string;
    } | null;
};
export type MatchScoreResult = {
    matchScore: number;
    reasons: string[];
};
export declare class MatchingService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreatePlatformSettings(): Promise<{
        id: string;
        ai_matching_enabled: boolean;
        updated_at: Date;
        updated_by: string | null;
    }>;
    isAiMatchingEnabled(): Promise<boolean>;
    computeMatchScore(creator: CreatorProfile, campaign: CampaignWithBrand): MatchScoreResult;
    runMatchingForCampaign(campaignId: string): Promise<{
        created: number;
        skipped: boolean;
    }>;
    runMatchingForAllActiveCampaigns(): Promise<{
        totalCreated: number;
        campaigns: number;
        enabled: boolean;
    }>;
    getAdminMatches(): Promise<{
        enabled: boolean;
        matches: {
            id: string;
            campaignTitle: string;
            campaignId: string;
            creatorName: string;
            creatorNiche: string;
            matchScore: number;
            reasons: string[];
            status: string;
            matchedAt: string;
            engagement: number;
            followers: number;
        }[];
    }>;
    updateMatchStatus(id: string, status: 'active' | 'removed' | 'forced', adminId?: string): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        match_score: number;
        reasons: string[];
        status: string;
        matched_at: Date;
    }>;
    getCreatorCampaignMatchScores(creatorId: string, campaignIds: string[]): Promise<Map<string, MatchScoreResult>>;
    getCampaignRecommendations(campaignId: string, brandUserId: string): Promise<{
        enabled: boolean;
        recommendations: {
            id: string;
            name: string;
            niche: string;
            followers: number;
            engagementRate: number;
            matchScore: number;
            matchReason: string;
            reasons: string[];
            platform: string;
            verified: boolean;
        }[];
    }>;
}
export {};
