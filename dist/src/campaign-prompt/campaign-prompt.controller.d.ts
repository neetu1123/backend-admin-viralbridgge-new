import { CampaignPromptEventDto } from './campaign-prompt.dto';
import { CampaignPromptService } from './campaign-prompt.service';
export declare class CampaignPromptController {
    private readonly campaignPrompt;
    constructor(campaignPrompt: CampaignPromptService);
    recordEvent(req: {
        user: {
            id: string;
        };
    }, body: CampaignPromptEventDto): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date;
        user_id: string;
        event_type: string;
    }>;
    getStatus(req: {
        user: {
            id: string;
        };
    }): Promise<{
        shouldShow: boolean;
        reason: string;
        campaignCount?: undefined;
        showAgainAt?: undefined;
        testMode?: undefined;
        dismissCooldownMs?: undefined;
    } | {
        shouldShow: boolean;
        reason: string;
        campaignCount: number;
        showAgainAt?: undefined;
        testMode?: undefined;
        dismissCooldownMs?: undefined;
    } | {
        shouldShow: boolean;
        reason: string;
        showAgainAt: string;
        campaignCount?: undefined;
        testMode?: undefined;
        dismissCooldownMs?: undefined;
    } | {
        shouldShow: boolean;
        reason: string;
        campaignCount: number;
        testMode: boolean;
        dismissCooldownMs: number;
        showAgainAt?: undefined;
    }>;
    getAnalytics(): Promise<{
        displayed: number;
        closed: number;
        createClicked: number;
        campaignCreated: number;
        conversionRate: number;
        clickThroughRate: number;
    }>;
}
