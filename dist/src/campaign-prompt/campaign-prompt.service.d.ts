import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CampaignPromptEventType } from './campaign-prompt.dto';
export declare class CampaignPromptService {
    private prisma;
    constructor(prisma: PrismaService);
    recordEvent(userId: string, eventType: CampaignPromptEventType, metadata?: Record<string, unknown>): Promise<{
        id: string;
        metadata: Prisma.JsonValue | null;
        created_at: Date;
        user_id: string;
        event_type: string;
    }>;
    getStatus(userId: string): Promise<{
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
