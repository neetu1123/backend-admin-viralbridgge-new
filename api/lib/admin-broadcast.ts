import type { PrismaClient } from '@prisma/client';
import type { EmailService } from '../../dist/src/email/email.service';
import type { NotificationsService } from '../../dist/src/notifications/notifications.service';

export type { BroadcastAudience, BroadcastBody } from '../../dist/src/admin/admin-broadcast.helper';

export async function sendAdminBroadcast(
  prisma: PrismaClient,
  email: EmailService,
  notifications: NotificationsService,
  body: import('../../dist/src/admin/admin-broadcast.helper').BroadcastBody,
  adminId?: string,
) {
  const { sendAdminBroadcast: send } = require('../../dist/src/admin/admin-broadcast.helper') as typeof import('../../dist/src/admin/admin-broadcast.helper');
  return send(prisma as never, email, notifications, body, adminId);
}

export function getEmailStatus(email: EmailService) {
  return email.getConfigStatus();
}

export async function sendTestEmail(email: EmailService, to: string) {
  if (!email.isConfigured()) {
    throw new Error('RESEND_API_KEY is not set on the server.');
  }
  await email.sendTestEmail(to);
  return { sent: true, to };
}
