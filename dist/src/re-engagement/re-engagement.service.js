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
var ReEngagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReEngagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const matching_service_1 = require("../matching/matching.service");
const user_activity_service_1 = require("../user-activity/user-activity.service");
const re_engagement_template_1 = require("../email/templates/re-engagement.template");
const TEST_MODE = process.env.RE_ENGAGEMENT_TEST_MODE === 'true';
function parseInactivePeriod(period) {
    if (TEST_MODE)
        return 5 * 60 * 1000;
    const match = period.match(/^(\d+)(m|d)$/);
    if (!match)
        return 7 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    return match[2] === 'm' ? value * 60 * 1000 : value * 24 * 60 * 60 * 1000;
}
let ReEngagementService = ReEngagementService_1 = class ReEngagementService {
    prisma;
    email;
    matching;
    userActivity;
    logger = new common_1.Logger(ReEngagementService_1.name);
    intervalRef = null;
    constructor(prisma, email, matching, userActivity) {
        this.prisma = prisma;
        this.email = email;
        this.matching = matching;
        this.userActivity = userActivity;
    }
    onModuleInit() {
        if (process.env.VERCEL || process.env.DISABLE_RE_ENGAGEMENT === 'true')
            return;
        const runDaily = () => {
            this.processInactiveUsers().catch((e) => this.logger.error('Re-engagement job failed', e));
        };
        if (TEST_MODE) {
            this.intervalRef = setInterval(runDaily, 5 * 60 * 1000);
            this.logger.log('Re-engagement test mode: running every 5 minutes');
        }
        else {
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
        const frequencyCutoff = new Date(Date.now() - settings.reengagement_email_frequency_days * 24 * 60 * 60 * 1000);
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
            if (user.notification_prefs && !user.notification_prefs.marketing_emails)
                continue;
            const lastActive = user.user_activity?.last_active ??
                user.user_activity?.last_login ??
                user.created_at;
            if (lastActive > cutoff)
                continue;
            const recentEmail = await this.prisma.reEngagementEmailLog.findFirst({
                where: { user_id: user.id, sent_at: { gte: frequencyCutoff } },
            });
            if (recentEmail)
                continue;
            try {
                await this.sendReEngagementEmail(user);
                sent += 1;
            }
            catch (e) {
                this.logger.error(`Failed to send re-engagement to ${user.email}`, e);
            }
        }
        this.logger.log(`Re-engagement job complete: sent ${sent} emails`);
        return { processed: users.length, sent };
    }
    async sendReEngagementEmail(user) {
        const roleName = user.role?.name ?? '';
        const isCreator = roleName === 'CREATOR';
        const subject = isCreator
            ? 'We Miss You! New Campaigns Are Waiting 🎉'
            : 'Ready to Launch Your Next Campaign?';
        const html = isCreator
            ? (0, re_engagement_template_1.buildCreatorReEngagementHtml)({ name: user.name, appUrl: this.email.getAppUrl() })
            : (0, re_engagement_template_1.buildBrandReEngagementHtml)({ name: user.name, appUrl: this.email.getAppUrl() });
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
    async markUserReturned(userId) {
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
};
exports.ReEngagementService = ReEngagementService;
exports.ReEngagementService = ReEngagementService = ReEngagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        matching_service_1.MatchingService,
        user_activity_service_1.UserActivityService])
], ReEngagementService);
//# sourceMappingURL=re-engagement.service.js.map