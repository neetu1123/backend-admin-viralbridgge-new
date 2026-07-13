import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { MatchingService } from '../matching/matching.service';
import { UserActivityService } from '../user-activity/user-activity.service';
import { buildBrandReEngagementHtml, buildCreatorReEngagementHtml } from '../email/templates/re-engagement.template';

const TEST_MODE = process.env.RE_ENGAGEMENT_TEST_MODE === 'true';

function parseInactivePeriod(period: string): number {
  if (TEST_MODE) return 5 * 60 * 1000;
  const match = period.match(/^(\d+)(m|d)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  return match[2] === 'm' ? value * 60 * 1000 : value * 24 * 60 * 60 * 1000;
}

@Injectable()
export class ReEngagementService implements OnModuleInit {
  private readonly logger = new Logger(ReEngagementService.name);
  private intervalRef: ReturnType<typeof setInterval> | null = null;

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private matching: MatchingService,
    private userActivity: UserActivityService,
  ) {}

  onModuleInit() {
    if (process.env.VERCEL || process.env.DISABLE_RE_ENGAGEMENT === 'true') return;

    const runDaily = () => {
      this.processInactiveUsers().catch((e) =>
        this.logger.error('Re-engagement job failed', e),
      );
    };

    if (TEST_MODE) {
      this.intervalRef = setInterval(runDaily, 5 * 60 * 1000);
      this.logger.log('Re-engagement test mode: running every 5 minutes');
    } else {
      this.intervalRef = setInterval(runDaily, 24 * 60 * 60 * 1000);
      runDaily();
      this.logger.log('Re-engagement scheduler started (daily)');
    }
  }

  async getSettings() {
    const settings = await this.matching.getOrCreatePlatformSettings();
    return {
      enabled: settings.reengagement_enabled,
      inactivePeriod: settings.reengagement_inactive_period,
      emailFrequencyDays: settings.reengagement_email_frequency_days,
    };
  }

  async getAnalytics() {
    const [sent, opened, returned] = await Promise.all([
      this.prisma.reEngagementEmailLog.count(),
      this.prisma.reEngagementEmailLog.count({ where: { opened_at: { not: null } } }),
      this.prisma.reEngagementEmailLog.count({ where: { returned_at: { not: null } } }),
    ]);

    return {
      emailsSent: sent,
      emailsOpened: opened,
      usersReturned: returned,
      openRate: sent > 0 ? Math.round((opened / sent) * 1000) / 10 : 0,
      returnRate: sent > 0 ? Math.round((returned / sent) * 1000) / 10 : 0,
    };
  }

  async processInactiveUsers() {
    const settings = await this.matching.getOrCreatePlatformSettings();
    if (!settings.reengagement_enabled) {
      this.logger.debug('Re-engagement disabled');
      return { processed: 0, sent: 0 };
    }

    const inactiveMs = parseInactivePeriod(settings.reengagement_inactive_period);
    const cutoff = new Date(Date.now() - inactiveMs);
    const frequencyCutoff = new Date(
      Date.now() - settings.reengagement_email_frequency_days * 24 * 60 * 60 * 1000,
    );

    const users = await this.prisma.user.findMany({
      where: {
        is_deleted: false,
        is_banned: false,
        role: { name: { in: ['CREATOR', 'BRAND'] } },
      },
      include: {
        role: true,
        user_activity: true,
        notification_prefs: true,
      },
    });

    let sent = 0;
    for (const user of users) {
      if (user.notification_prefs && !user.notification_prefs.marketing_emails) continue;

      const lastActive =
        user.user_activity?.last_active ??
        user.user_activity?.last_login ??
        user.created_at;

      if (lastActive > cutoff) continue;

      const recentEmail = await this.prisma.reEngagementEmailLog.findFirst({
        where: { user_id: user.id, sent_at: { gte: frequencyCutoff } },
      });
      if (recentEmail) continue;

      try {
        await this.sendReEngagementEmail(user);
        sent += 1;
      } catch (e) {
        this.logger.error(`Failed to send re-engagement to ${user.email}`, e);
      }
    }

    this.logger.log(`Re-engagement job complete: sent ${sent} emails`);
    return { processed: users.length, sent };
  }

  private async sendReEngagementEmail(user: {
    id: string;
    name: string;
    email: string;
    role: { name: string } | null;
  }) {
    const roleName = user.role?.name ?? '';
    const isCreator = roleName === 'CREATOR';

    const subject = isCreator
      ? 'We Miss You! New Campaigns Are Waiting 🎉'
      : 'Ready to Launch Your Next Campaign?';

    const html = isCreator
      ? buildCreatorReEngagementHtml({ name: user.name, appUrl: this.email.getAppUrl() })
      : buildBrandReEngagementHtml({ name: user.name, appUrl: this.email.getAppUrl() });

    await this.email.sendReEngagementEmail({ to: user.email, subject, html });

    await this.prisma.reEngagementEmailLog.create({
      data: {
        user_id: user.id,
        user_type: roleName,
        email: user.email,
        subject,
      },
    });
  }

  async markUserReturned(userId: string) {
    const recent = await this.prisma.reEngagementEmailLog.findFirst({
      where: { user_id: userId, returned_at: null },
      orderBy: { sent_at: 'desc' },
    });
    if (recent) {
      await this.prisma.reEngagementEmailLog.update({
        where: { id: recent.id },
        data: { returned_at: new Date() },
      });
    }
  }
}
