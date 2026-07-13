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
exports.CampaignPromptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const TEST_MODE = process.env.CAMPAIGN_PROMPT_TEST_MODE === 'true';
const DISMISS_MS = TEST_MODE ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
let CampaignPromptService = class CampaignPromptService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordEvent(userId, eventType, metadata) {
        return this.prisma.campaignPromptEvent.create({
            data: {
                user_id: userId,
                event_type: eventType,
                metadata: (metadata ?? {}),
            },
        });
    }
    async getStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                brand_profile: { include: { _count: { select: { campaigns: true } } } },
            },
        });
        if (!user || user.role?.name !== 'BRAND') {
            return { shouldShow: false, reason: 'not_brand' };
        }
        const campaignCount = user.brand_profile?._count.campaigns ?? 0;
        const hasCampaigns = campaignCount > 0;
        if (!TEST_MODE && hasCampaigns) {
            return { shouldShow: false, reason: 'has_campaigns', campaignCount };
        }
        const lastClosed = await this.prisma.campaignPromptEvent.findFirst({
            where: { user_id: userId, event_type: 'CLOSED' },
            orderBy: { created_at: 'desc' },
        });
        if (lastClosed) {
            const elapsed = Date.now() - lastClosed.created_at.getTime();
            if (elapsed < DISMISS_MS) {
                return {
                    shouldShow: false,
                    reason: 'dismissed_recently',
                    showAgainAt: new Date(lastClosed.created_at.getTime() + DISMISS_MS).toISOString(),
                };
            }
        }
        return {
            shouldShow: true,
            reason: TEST_MODE ? 'test_mode' : hasCampaigns ? 'brand_no_campaigns' : 'brand_no_campaigns',
            campaignCount,
            testMode: TEST_MODE,
            dismissCooldownMs: DISMISS_MS,
        };
    }
    async getAnalytics() {
        const [displayed, closed, createClicked, campaignCreated] = await Promise.all([
            this.prisma.campaignPromptEvent.count({ where: { event_type: 'DISPLAYED' } }),
            this.prisma.campaignPromptEvent.count({ where: { event_type: 'CLOSED' } }),
            this.prisma.campaignPromptEvent.count({ where: { event_type: 'CREATE_CLICKED' } }),
            this.prisma.campaignPromptEvent.count({ where: { event_type: 'CAMPAIGN_CREATED' } }),
        ]);
        const conversionRate = displayed > 0 ? Math.round((campaignCreated / displayed) * 1000) / 10 : 0;
        const clickThroughRate = displayed > 0 ? Math.round((createClicked / displayed) * 1000) / 10 : 0;
        return {
            displayed,
            closed,
            createClicked,
            campaignCreated,
            conversionRate,
            clickThroughRate,
        };
    }
};
exports.CampaignPromptService = CampaignPromptService;
exports.CampaignPromptService = CampaignPromptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignPromptService);
//# sourceMappingURL=campaign-prompt.service.js.map