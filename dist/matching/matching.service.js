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
exports.MatchingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_MATCHES_PER_CAMPAIGN = 10;
const MIN_SCORE_TO_STORE = 55;
const aiMatchWithCreatorInclude = {
    creator: { include: { user: true } },
};
function isMissingTableError(error) {
    const msg = error instanceof Error ? error.message : String(error);
    return (msg.includes('does not exist') ||
        msg.includes('platform_settings') ||
        msg.includes('ai_matches') ||
        msg.includes('platformSettings') ||
        msg.includes('aiMatch') ||
        msg.includes('P2021'));
}
const DEFAULT_PLATFORM_SETTINGS = {
    id: 'default',
    ai_matching_enabled: true,
    updated_at: new Date(),
    updated_by: null,
};
let MatchingService = class MatchingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreatePlatformSettings() {
        try {
            let settings = await this.prisma.platformSettings.findUnique({ where: { id: 'default' } });
            if (!settings) {
                settings = await this.prisma.platformSettings.create({
                    data: { id: 'default', ai_matching_enabled: true },
                });
            }
            return settings;
        }
        catch (error) {
            if (isMissingTableError(error)) {
                console.warn('[MatchingService] platform_settings missing — run: npx prisma migrate deploy');
                return DEFAULT_PLATFORM_SETTINGS;
            }
            throw error;
        }
    }
    async isAiMatchingEnabled() {
        const settings = await this.getOrCreatePlatformSettings();
        return settings.ai_matching_enabled;
    }
    computeMatchScore(creator, campaign) {
        const reasons = [];
        let score = 0;
        const niche = (creator.niche ?? '').toLowerCase();
        const industry = (campaign.brand?.industry ?? '').toLowerCase();
        const description = campaign.description.toLowerCase();
        const title = campaign.title.toLowerCase();
        const nicheWords = niche.split(/[\s,&]+/).filter(Boolean);
        let nicheScore = 0;
        if (niche && (industry.includes(niche) || niche.includes(industry))) {
            nicheScore = 100;
            reasons.push(`${creator.niche} niche aligns with brand industry`);
        }
        else if (nicheWords.some((w) => w.length > 3 && (description.includes(w) || title.includes(w)))) {
            nicheScore = 75;
            reasons.push(`${creator.niche ?? 'Creator'} content matches campaign theme`);
        }
        else if (niche) {
            nicheScore = 40;
            reasons.push(`Partial niche overlap — ${creator.niche}`);
        }
        score += nicheScore * 0.3;
        const engagementThreshold = campaign.budget >= 5000 ? 5 : campaign.budget >= 2000 ? 4 : 3;
        let engagementScore = 0;
        if (creator.engagement_rate >= engagementThreshold + 2) {
            engagementScore = 100;
            reasons.push(`High engagement rate (${creator.engagement_rate.toFixed(1)}%)`);
        }
        else if (creator.engagement_rate >= engagementThreshold) {
            engagementScore = 80;
            reasons.push(`Engagement rate (${creator.engagement_rate.toFixed(1)}%) meets campaign threshold`);
        }
        else if (creator.engagement_rate >= engagementThreshold - 1) {
            engagementScore = 55;
        }
        else {
            engagementScore = 30;
        }
        score += engagementScore * 0.25;
        const expectedFollowers = campaign.budget >= 5000 ? 50000 : campaign.budget >= 2000 ? 25000 : 10000;
        let followerScore = 0;
        if (creator.followers >= expectedFollowers) {
            followerScore = 100;
            reasons.push(`${(creator.followers / 1000).toFixed(1)}K followers — strong reach for budget tier`);
        }
        else if (creator.followers >= expectedFollowers * 0.5) {
            followerScore = 70;
            reasons.push(`${(creator.followers / 1000).toFixed(1)}K followers — adequate reach`);
        }
        else {
            followerScore = 40;
        }
        score += followerScore * 0.15;
        let localityScore = 50;
        if (creator.locality && campaign.locality) {
            const cLoc = creator.locality.toLowerCase();
            const campLoc = campaign.locality.toLowerCase();
            if (cLoc === campLoc || campLoc === 'global' || cLoc === 'global') {
                localityScore = 100;
                reasons.push(`Location match — ${creator.locality}`);
            }
            else if (cLoc.includes(campLoc) || campLoc.includes(cLoc)) {
                localityScore = 75;
                reasons.push(`Regional overlap — ${creator.locality} / ${campaign.locality}`);
            }
        }
        score += localityScore * 0.15;
        const creatorLangs = creator.languages.map((l) => l.toLowerCase());
        const campaignLangs = campaign.languages.map((l) => l.toLowerCase());
        const sharedLangs = creatorLangs.filter((l) => campaignLangs.includes(l));
        let languageScore = sharedLangs.length > 0 ? 100 : campaignLangs.length === 0 ? 60 : 30;
        if (sharedLangs.length > 0) {
            reasons.push(`Language overlap — ${sharedLangs.join(', ')}`);
        }
        score += languageScore * 0.15;
        const matchScore = Math.min(97, Math.round(score));
        if (reasons.length === 0) {
            reasons.push(`${campaign.platform} campaign — budget $${campaign.budget.toLocaleString()}`);
        }
        return { matchScore, reasons: reasons.slice(0, 4) };
    }
    async runMatchingForCampaign(campaignId) {
        const enabled = await this.isAiMatchingEnabled();
        if (!enabled)
            return { created: 0, skipped: true };
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { brand: true, applications: { select: { creator_id: true } } },
        });
        if (!campaign || campaign.status !== 'ACTIVE')
            return { created: 0, skipped: true };
        const appliedCreatorIds = new Set(campaign.applications.map((a) => a.creator_id));
        const creators = await this.prisma.creatorProfile.findMany({
            include: { user: true },
        });
        const scored = creators
            .filter((c) => !appliedCreatorIds.has(c.id))
            .map((creator) => ({
            creator,
            ...this.computeMatchScore(creator, campaign),
        }))
            .filter((s) => s.matchScore >= MIN_SCORE_TO_STORE)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, MAX_MATCHES_PER_CAMPAIGN);
        let created = 0;
        for (const item of scored) {
            await this.prisma.aiMatch.upsert({
                where: {
                    campaign_id_creator_id: {
                        campaign_id: campaignId,
                        creator_id: item.creator.id,
                    },
                },
                create: {
                    campaign_id: campaignId,
                    creator_id: item.creator.id,
                    match_score: item.matchScore,
                    reasons: item.reasons,
                    status: 'active',
                },
                update: {
                    match_score: item.matchScore,
                    reasons: item.reasons,
                    matched_at: new Date(),
                },
            });
            created++;
        }
        return { created, skipped: false };
    }
    async runMatchingForAllActiveCampaigns() {
        const enabled = await this.isAiMatchingEnabled();
        if (!enabled)
            return { totalCreated: 0, campaigns: 0, enabled: false };
        const campaigns = await this.prisma.campaign.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });
        let totalCreated = 0;
        for (const campaign of campaigns) {
            const result = await this.runMatchingForCampaign(campaign.id);
            totalCreated += result.created;
        }
        return { totalCreated, campaigns: campaigns.length, enabled: true };
    }
    async getAdminMatches() {
        const enabled = await this.isAiMatchingEnabled();
        if (!enabled) {
            return { enabled: false, matches: [] };
        }
        const matches = await this.prisma.aiMatch.findMany({
            include: {
                campaign: { include: { brand: true } },
                creator: { include: { user: true } },
            },
            orderBy: [{ match_score: 'desc' }, { matched_at: 'desc' }],
            take: 100,
        });
        return {
            enabled: true,
            matches: matches.map((m) => ({
                id: m.id,
                campaignTitle: m.campaign.title,
                campaignId: m.campaign_id,
                creatorName: m.creator.full_name ?? m.creator.user?.name ?? 'Creator',
                creatorNiche: m.creator.niche ?? 'General',
                matchScore: m.match_score,
                reasons: m.reasons,
                status: m.status === 'forced' ? 'force_matched' : m.status,
                matchedAt: m.matched_at.toISOString().slice(0, 10),
                engagement: m.creator.engagement_rate,
                followers: m.creator.followers,
            })),
        };
    }
    async updateMatchStatus(id, status, adminId) {
        const enabled = await this.isAiMatchingEnabled();
        if (!enabled) {
            throw new common_1.ForbiddenException('AI matching is disabled');
        }
        const match = await this.prisma.aiMatch.findUnique({ where: { id } });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        const dbStatus = status === 'forced' ? 'forced' : status;
        const updated = await this.prisma.aiMatch.update({
            where: { id },
            data: { status: dbStatus },
        });
        if (adminId) {
            try {
                await this.prisma.auditLog.create({
                    data: {
                        admin_id: adminId,
                        action: status === 'forced' ? 'FORCE_MATCH' : status === 'removed' ? 'REMOVE_MATCH' : 'RESTORE_MATCH',
                        entity: 'AiMatch',
                        entity_id: id,
                        metadata: { status: dbStatus, campaign_id: match.campaign_id, creator_id: match.creator_id },
                    },
                });
            }
            catch {
            }
        }
        return updated;
    }
    async getCreatorCampaignMatchScores(creatorId, campaignIds) {
        const enabled = await this.isAiMatchingEnabled();
        if (!enabled || campaignIds.length === 0) {
            return new Map();
        }
        const stored = await this.prisma.aiMatch.findMany({
            where: {
                creator_id: creatorId,
                campaign_id: { in: campaignIds },
                status: { in: ['active', 'forced'] },
            },
        });
        const map = new Map();
        for (const m of stored) {
            map.set(m.campaign_id, { matchScore: m.match_score, reasons: m.reasons });
        }
        const missingIds = campaignIds.filter((id) => !map.has(id));
        if (missingIds.length === 0)
            return map;
        const [creator, campaigns] = await Promise.all([
            this.prisma.creatorProfile.findUnique({ where: { id: creatorId }, include: { user: true } }),
            this.prisma.campaign.findMany({
                where: { id: { in: missingIds } },
                include: { brand: true },
            }),
        ]);
        if (!creator)
            return map;
        for (const campaign of campaigns) {
            const result = this.computeMatchScore(creator, campaign);
            if (result.matchScore >= MIN_SCORE_TO_STORE) {
                map.set(campaign.id, result);
            }
        }
        return map;
    }
    async getCampaignRecommendations(campaignId, brandUserId) {
        const enabled = await this.isAiMatchingEnabled();
        if (!enabled) {
            return { enabled: false, recommendations: [] };
        }
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { brand: true, applications: { select: { creator_id: true } } },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.brand.user_id !== brandUserId) {
            throw new common_1.ForbiddenException('Not your campaign');
        }
        const appliedIds = new Set(campaign.applications.map((a) => a.creator_id));
        let stored = [];
        try {
            stored = await this.prisma.aiMatch.findMany({
                where: {
                    campaign_id: campaignId,
                    status: { in: ['active', 'forced'] },
                },
                include: aiMatchWithCreatorInclude,
                orderBy: { match_score: 'desc' },
                take: MAX_MATCHES_PER_CAMPAIGN,
            });
        }
        catch (error) {
            if (isMissingTableError(error)) {
                return { enabled: true, recommendations: [] };
            }
            throw error;
        }
        const recommendations = stored
            .filter((m) => !appliedIds.has(m.creator_id))
            .map((m) => ({
            id: m.creator.id,
            name: m.creator.full_name ?? m.creator.user?.name ?? 'Creator',
            niche: m.creator.niche ?? 'General',
            followers: m.creator.followers,
            engagementRate: m.creator.engagement_rate,
            matchScore: m.match_score,
            matchReason: m.reasons[0] ?? `${m.match_score}% match`,
            reasons: m.reasons,
            platform: campaign.platform,
            verified: Boolean(m.creator.user?.is_verified),
        }));
        if (recommendations.length > 0) {
            return { enabled: true, recommendations };
        }
        try {
            await this.runMatchingForCampaign(campaignId);
        }
        catch (error) {
            if (!isMissingTableError(error))
                throw error;
            return { enabled: true, recommendations: [] };
        }
        let refreshed = [];
        try {
            refreshed = await this.prisma.aiMatch.findMany({
                where: {
                    campaign_id: campaignId,
                    status: { in: ['active', 'forced'] },
                },
                include: aiMatchWithCreatorInclude,
                orderBy: { match_score: 'desc' },
                take: MAX_MATCHES_PER_CAMPAIGN,
            });
        }
        catch (error) {
            if (isMissingTableError(error)) {
                return { enabled: true, recommendations: [] };
            }
            throw error;
        }
        return {
            enabled: true,
            recommendations: refreshed
                .filter((m) => !appliedIds.has(m.creator_id))
                .map((m) => ({
                id: m.creator.id,
                name: m.creator.full_name ?? m.creator.user?.name ?? 'Creator',
                niche: m.creator.niche ?? 'General',
                followers: m.creator.followers,
                engagementRate: m.creator.engagement_rate,
                matchScore: m.match_score,
                matchReason: m.reasons[0] ?? `${m.match_score}% match`,
                reasons: m.reasons,
                platform: campaign.platform,
                verified: Boolean(m.creator.user?.is_verified),
            })),
        };
    }
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchingService);
//# sourceMappingURL=matching.service.js.map