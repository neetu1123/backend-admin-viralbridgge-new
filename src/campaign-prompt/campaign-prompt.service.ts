import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CampaignPromptEventType } from './campaign-prompt.dto';

const TEST_MODE = process.env.CAMPAIGN_PROMPT_TEST_MODE === 'true';
const DISMISS_MS = TEST_MODE ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;

@Injectable()
export class CampaignPromptService {
  constructor(private prisma: PrismaService) {}

  async recordEvent(userId: string, eventType: CampaignPromptEventType, metadata?: Record<string, unknown>) {
    return this.prisma.campaignPromptEvent.create({
      data: {
        user_id: userId,
        event_type: eventType,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async getStatus(userId: string) {
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

    const conversionRate =
      displayed > 0 ? Math.round((campaignCreated / displayed) * 1000) / 10 : 0;
    const clickThroughRate =
      displayed > 0 ? Math.round((createClicked / displayed) * 1000) / 10 : 0;

    return {
      displayed,
      closed,
      createClicked,
      campaignCreated,
      conversionRate,
      clickThroughRate,
    };
  }
}
