import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  DEFAULT_APP_URL,
  DEFAULT_FROM_EMAIL,
  type InvitationAcceptedEmailParams,
  type MemberRemovedEmailParams,
  type TeamInvitationEmailParams,
} from './email.constants';
import { buildInvitationAcceptedHtml } from './templates/invitation-accepted.template';
import { buildMemberRemovedHtml } from './templates/member-removed.template';
import { buildTeamInvitationHtml, buildTeamReInvitationHtml } from './templates/team-invitation.template';
import { buildBroadcastHtml } from './templates/broadcast.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim() ?? '';
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = this.config.get<string>('RESEND_FROM_EMAIL')?.trim() || DEFAULT_FROM_EMAIL;
    this.appUrl = (
      this.config.get<string>('APP_URL') ??
      this.config.get<string>('FRONTEND_URL') ??
      DEFAULT_APP_URL
    ).replace(/\/$/, '');
  }

  buildInvitationAcceptUrl(token: string): string {
    return `${this.appUrl}/team/invitation/${token}`;
  }

  isConfigured(): boolean {
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

  /** Resend onboarding test — verify API key and sender domain. */
  async sendTestEmail(to = 'neetuchaurasiya5041@gmail.com'): Promise<void> {
    await this.send({
      to,
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
    });
  }

  async sendTeamInvitation(params: TeamInvitationEmailParams): Promise<void> {
    await this.send({
      to: params.to,
      subject: "You're invited to join ViralBridge",
      html: buildTeamInvitationHtml(params),
    });
  }

  async sendReInvitation(params: TeamInvitationEmailParams): Promise<void> {
    await this.send({
      to: params.to,
      subject: `Reminder: Join ${params.organizationName} on ViralBridge`,
      html: buildTeamReInvitationHtml(params),
    });
  }

  async sendInvitationAccepted(params: InvitationAcceptedEmailParams): Promise<void> {
    await this.send({
      to: params.to,
      subject: `${params.memberName} accepted your team invitation`,
      html: buildInvitationAcceptedHtml(params),
    });
  }

  async sendMemberRemoved(params: MemberRemovedEmailParams): Promise<void> {
    await this.send({
      to: params.to,
      subject: `You were removed from ${params.organizationName}`,
      html: buildMemberRemovedHtml(params),
    });
  }

  async sendWithdrawalOtp(to: string, code: string): Promise<void> {
    await this.send({
      to,
      subject: 'Withdrawal verification code',
      html: `<p>Your ViralBridge withdrawal OTP is <strong>${code}</strong>. Valid for 10 minutes.</p>`,
    });
  }

  async sendBroadcastEmail(params: {
    to: string;
    subject: string;
    title: string;
    message: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: params.subject,
      html: buildBroadcastHtml({
        title: params.title,
        message: params.message,
        ctaLabel: params.ctaLabel,
        ctaUrl: params.ctaUrl,
      }),
    });
  }

  private async send(payload: { to: string; subject: string; html: string }): Promise<void> {
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
}
