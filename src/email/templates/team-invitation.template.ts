import type { TeamInvitationEmailParams } from '../email.constants';
import { escapeHtml, formatEmailDate, primaryButton, wrapEmailHtml } from './base.template';

export function buildTeamInvitationHtml(params: TeamInvitationEmailParams): string {
  const title = `You've been invited to join ${params.organizationName}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">
      You've been invited to join ${escapeHtml(params.organizationName)}
    </h1>
    <p style="margin:0 0 12px;font-size:15px;color:#475569;line-height:1.6;text-align:center;">
      <strong>${escapeHtml(params.inviterName)}</strong> has invited you to join
      <strong>${escapeHtml(params.organizationName)}</strong> as:
    </p>
    <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#7c3aed;text-align:center;">
      ${escapeHtml(params.roleLabel)}
    </p>
    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;text-align:center;">
      Click the button below to accept the invitation.
    </p>
    ${primaryButton('Accept Invitation', params.acceptUrl)}
    <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
      This invitation will expire on ${escapeHtml(formatEmailDate(params.expiresAt))} (7 days).
    </p>
    <p style="margin:12px 0 0;font-size:12px;color:#cbd5e1;line-height:1.6;text-align:center;">
      If you did not expect this invitation, you may safely ignore this email.
    </p>`;

  return wrapEmailHtml(title, body);
}

export function buildTeamReInvitationHtml(params: TeamInvitationEmailParams): string {
  const title = `Reminder: Join ${params.organizationName} on ViralBridge`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">
      Invitation reminder
    </h1>
    <p style="margin:0 0 12px;font-size:15px;color:#475569;line-height:1.6;text-align:center;">
      <strong>${escapeHtml(params.inviterName)}</strong> has resent your invitation to join
      <strong>${escapeHtml(params.organizationName)}</strong> as
      <strong>${escapeHtml(params.roleLabel)}</strong>.
    </p>
    ${primaryButton('Accept Invitation', params.acceptUrl)}
    <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
      This invitation will expire on ${escapeHtml(formatEmailDate(params.expiresAt))}.
    </p>`;

  return wrapEmailHtml(title, body);
}
