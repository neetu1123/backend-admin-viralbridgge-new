import type { PrismaClient } from '@prisma/client';
import { getOrCreatePlatformSettings } from './platform-settings';

export async function getAdminMatchesResponse(prisma: PrismaClient) {
  const settings = await getOrCreatePlatformSettings(prisma);
  if (!settings.ai_matching_enabled) {
    return { enabled: false, matches: [] };
  }

  try {
    const matches = await prisma.aiMatch.findMany({
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('does not exist') || msg.includes('ai_matches') || msg.includes('P2021')) {
      return { enabled: true, matches: [] };
    }
    throw error;
  }
}

export async function updateMatchStatus(
  prisma: PrismaClient,
  id: string,
  status: 'active' | 'removed' | 'forced',
) {
  const settings = await getOrCreatePlatformSettings(prisma);
  if (!settings.ai_matching_enabled) {
    throw new Error('AI matching is disabled');
  }

  const match = await prisma.aiMatch.findUnique({ where: { id } });
  if (!match) {
    throw new Error('Match not found');
  }

  return prisma.aiMatch.update({
    where: { id },
    data: { status },
  });
}
