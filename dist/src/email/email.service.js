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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
const email_constants_1 = require("./email.constants");
const invitation_accepted_template_1 = require("./templates/invitation-accepted.template");
const member_removed_template_1 = require("./templates/member-removed.template");
const team_invitation_template_1 = require("./templates/team-invitation.template");
const broadcast_template_1 = require("./templates/broadcast.template");
let EmailService = EmailService_1 = class EmailService {
    config;
    logger = new common_1.Logger(EmailService_1.name);
    resend;
    fromEmail;
    appUrl;
    constructor(config) {
        this.config = config;
        const apiKey = this.config.get('RESEND_API_KEY')?.trim() ?? '';
        this.resend = apiKey ? new resend_1.Resend(apiKey) : null;
        this.fromEmail = this.config.get('RESEND_FROM_EMAIL')?.trim() || email_constants_1.DEFAULT_FROM_EMAIL;
        this.appUrl = (this.config.get('APP_URL') ??
            this.config.get('FRONTEND_URL') ??
            email_constants_1.DEFAULT_APP_URL).replace(/\/$/, '');
    }
    buildInvitationAcceptUrl(token) {
        return `${this.appUrl}/team/invitation/${token}`;
    }
    isConfigured() {
        return Boolean(this.resend);
    }
    getConfigStatus() {
        return {
            configured: this.isConfigured(),
            fromEmail: this.fromEmail,
            appUrl: this.appUrl,
            provider: 'Resend',
            hint: this.isConfigured()
                ? 'Emails send via Resend. Verify your domain at resend.com/domains.'
                : 'Set RESEND_API_KEY and RESEND_FROM_EMAIL in backend environment variables (Vercel → Settings → Environment Variables).',
        };
    }
    async sendTestEmail(to = 'neetuchaurasiya5041@gmail.com') {
        await this.send({
            to,
            subject: 'Hello World',
            html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
        });
    }
    async sendTeamInvitation(params) {
        await this.send({
            to: params.to,
            subject: "You're invited to join ViralBridge",
            html: (0, team_invitation_template_1.buildTeamInvitationHtml)(params),
        });
    }
    async sendReInvitation(params) {
        await this.send({
            to: params.to,
            subject: `Reminder: Join ${params.organizationName} on ViralBridge`,
            html: (0, team_invitation_template_1.buildTeamReInvitationHtml)(params),
        });
    }
    async sendInvitationAccepted(params) {
        await this.send({
            to: params.to,
            subject: `${params.memberName} accepted your team invitation`,
            html: (0, invitation_accepted_template_1.buildInvitationAcceptedHtml)(params),
        });
    }
    async sendMemberRemoved(params) {
        await this.send({
            to: params.to,
            subject: `You were removed from ${params.organizationName}`,
            html: (0, member_removed_template_1.buildMemberRemovedHtml)(params),
        });
    }
    async sendWithdrawalOtp(to, code) {
        await this.send({
            to,
            subject: 'Withdrawal verification code',
            html: `<p>Your ViralBridge withdrawal OTP is <strong>${code}</strong>. Valid for 10 minutes.</p>`,
        });
    }
    async sendBroadcastEmail(params) {
        await this.send({
            to: params.to,
            subject: params.subject,
            html: (0, broadcast_template_1.buildBroadcastHtml)({
                title: params.title,
                message: params.message,
                ctaLabel: params.ctaLabel,
                ctaUrl: params.ctaUrl,
            }),
        });
    }
    async send(payload) {
        if (!this.resend) {
            this.logger.error('RESEND_API_KEY is not configured — cannot send email');
            throw new Error('Email service is not configured. Set RESEND_API_KEY on the server.');
        }
        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });
        if (error) {
            this.logger.error(`Resend API error: ${error.message}`);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map