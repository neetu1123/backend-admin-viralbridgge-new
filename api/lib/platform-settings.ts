import type { PrismaClient } from '@prisma/client';

type PlatformSettingsRow = {
  id: string;
  ai_matching_enabled: boolean;
  platform_fee_percent?: number;
  updated_at: Date;
  updated_by: string | null;
};

function isMissingTableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('does not exist') ||
    msg.includes('platform_settings') ||
    msg.includes('platformSettings') ||
    msg.includes('P2021') ||
    msg.includes('Unknown model') ||
    msg.includes('Cannot read properties of undefined')
  );
}

const DEFAULT_SETTINGS: PlatformSettingsRow = {
  id: 'default',
  ai_matching_enabled: true,
  platform_fee_percent: 10,
  updated_at: new Date(),
  updated_by: null,
};

export async function getOrCreatePlatformSettings(prisma: PrismaClient): Promise<PlatformSettingsRow> {
  try {
    let settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'default', ai_matching_enabled: true, platform_fee_percent: 10 },
      });
    }
    return settings;
  } catch (error) {
    if (isMissingTableError(error)) {
      console.warn('[platform-settings] table not found — using defaults. Run: npx prisma migrate deploy');
      return DEFAULT_SETTINGS;
    }
    throw error;
  }
}

export async function getSettingsResponse(prisma: PrismaClient) {
  const settings = await getOrCreatePlatformSettings(prisma);
  return {
    aiMatchingEnabled: settings.ai_matching_enabled,
    platformFeePercent: Number(settings.platform_fee_percent ?? 10),
    updatedAt: settings.updated_at,
  };
}

export async function updateSettingsResponse(
  prisma: PrismaClient,
  body: { aiMatchingEnabled?: boolean; platformFeePercent?: number },
  adminId?: string,
) {
  try {
    await getOrCreatePlatformSettings(prisma);
    if (body.platformFeePercent != null && (body.platformFeePercent < 0 || body.platformFeePercent > 50)) {
      throw new Error('Platform fee must be between 0 and 50 percent');
    }
    const updated = await prisma.platformSettings.update({
      where: { id: 'default' },
      data: {
        ai_matching_enabled: body.aiMatchingEnabled ?? true,
        ...(body.platformFeePercent != null ? { platform_fee_percent: body.platformFeePercent } : {}),
        updated_by: adminId ?? null,
      },
    });

    return {
      aiMatchingEnabled: updated.ai_matching_enabled,
      platformFeePercent: Number((updated as PlatformSettingsRow).platform_fee_percent ?? 10),
      updatedAt: updated.updated_at,
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error('Database not migrated. Run: npx prisma migrate deploy on the backend database.');
    }
    throw error;
  }
}
