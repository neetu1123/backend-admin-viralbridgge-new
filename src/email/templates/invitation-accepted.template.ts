import type { InvitationAcceptedEmailParams } from '../email.constants';
import { escapeHtml, wrapEmailHtml } from './base.template';

export function buildInvitationAcceptedHtml(params: InvitationAcceptedEmailParams): string {
  const title = `${params.memberName} joined your team`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">
      Invitation accepted
    </h1>
    <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;text-align:center;">
      <strong>${escapeHtml(params.memberName)}</strong> (${escapeHtml(params.memberEmail)}) has accepted your invitation
      and joined <strong>${escapeHtml(params.organizationName)}</strong> as
      <strong>${escapeHtml(params.roleLabel)}</strong>.
    </p>`;

  return wrapEmailHtml(title, body);
}
