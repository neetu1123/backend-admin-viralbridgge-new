import type { PrismaClient } from '@prisma/client';
import type { EmailService } from '../../dist/src/email/email.service';
import { createNotification } from './notifications';

export type BroadcastAudience = 'all' | 'creators' | 'brands' | 'admins';

export interface BroadcastBody {
  subject: string;
  title: string;
  message: string;
  audience?: BroadcastAudience;
  sendInApp?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
}

const DEFAULT_APP_URL = 'https://admin-viralbridgge-new.vercel.app';

export function getEmailStatus(email: EmailService) {
  if (typeof email.getConfigStatus === 'function') {
    return email.getConfigStatus();
  }

  const configured = email.isConfigured();
  return {
    configured,
    fromEmail: process.env.RESEND_FROM_EMAIL?.trim() || 'James <James@getstrsites.com>',
    appUrl: (process.env.APP_URL ?? process.env.FRONTEND_URL ?? DEFAULT_APP_URL).replace(/\/$/, ''),
    provider: 'Resend',
    hint: configured
      ? 'Emails send via Resend. Verify your domain at resend.com/domains.'
      : 'Set RESEND_API_KEY and RESEND_FROM_EMAIL in backend environment variables (Vercel → Settings → Environment Variables).',
  };
}

export async function sendTestEmail(email: EmailService, to: string) {
  if (!email.isConfigured()) {
    throw new Error('RESEND_API_KEY is not set on the server.');
  }
  await email.sendTestEmail(to);
  return { sent: true, to };
}

async function resolveRecipients(prisma: PrismaClient, audience: BroadcastAudience) {
  const roleMap: Record<BroadcastAudience, string[]> = {
    all: ['CREATOR', 'BRAND'],
    creators: ['CREATOR'],
    brands: ['BRAND'],
    admins: ['ADMIN', 'SUPER_ADMIN'],
  };

  return prisma.user.findMany({
    where: {
      is_deleted: false,
      is_banned: false,
      role: { name: { in: roleMap[audience] } },
    },
    select: { id: true, email: true, name: true },
  });
}

export async function sendAdminBroadcast(
  prisma: PrismaClient,
  email: EmailService,
  body: BroadcastBody,
  adminId?: string,
) {
  if (!email.isConfigured()) {
    throw new Error(
      'Email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to your backend environment (Vercel → Project → Settings → Environment Variables), then redeploy.',
    );
  }

  if (!body.subject?.trim() || !body.title?.trim() || !body.message?.trim()) {
    throw new Error('Subject, title, and message are required');
  }

  const audience = body.audience ?? 'all';
  const recipients = await resolveRecipients(prisma, audience);
  if (!recipients.length) {
    return { sent: 0, failed: 0, inApp: 0, total: 0, audience, errors: [] as string[] };
  }

  let sent = 0;
  let failed = 0;
  let inApp = 0;
  const errors: string[] = [];

  for (const user of recipients) {
    if (body.sendInApp !== false) {
      try {
        await createNotification(prisma, {
          userId: user.id,
          title: body.title,
          message: body.message,
          type: 'SYSTEM',
          metadata: { audience, adminId, broadcast: true },
        });
        inApp += 1;
      } catch (err) {
        errors.push(`In-app ${user.email}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    try {
      if (typeof email.sendBroadcastEmail !== 'function') {
        throw new Error('Backend build is outdated — redeploy backend-admin-viralbridgge with the latest code.');
      }
      await email.sendBroadcastEmail({
        to: user.email,
        subject: body.subject.trim(),
        title: body.title.trim(),
        message: body.message.trim(),
        ctaLabel: body.ctaLabel,
        ctaUrl: body.ctaUrl,
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      errors.push(`${user.email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (adminId) {
    try {
      await prisma.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'SEND_BROADCAST',
          entity: 'Broadcast',
          entity_id: audience,
          metadata: { subject: body.subject, sent, failed, inApp, total: recipients.length },
        },
      });
    } catch {
      /* non-fatal */
    }
  }

  return {
    sent,
    failed,
    inApp,
    total: recipients.length,
    audience,
    errors: errors.slice(0, 5),
  };
}
