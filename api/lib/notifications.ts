import type { PrismaClient } from '@prisma/client';

export type NotificationType =
  | 'SYSTEM'
  | 'KYC'
  | 'CAMPAIGN'
  | 'APPLICATION'
  | 'PAYMENT'
  | 'WITHDRAWAL'
  | 'DISPUTE'
  | 'MESSAGE';

export function formatNotification(row: {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: Date;
  metadata?: unknown;
}) {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    message: row.body,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    is_read: row.is_read,
    created_at: row.created_at,
    metadata: row.metadata ?? null,
  };
}

export async function createNotification(
  prisma: PrismaClient,
  params: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const notification = await prisma.notification.create({
    data: {
      user_id: params.userId,
      title: params.title,
      body: params.message,
      type: params.type ?? 'SYSTEM',
      entity_type: params.entityType,
      entity_id: params.entityId,
      metadata: params.metadata ?? {},
    },
  });
  const formatted = formatNotification(notification);
  try {
    const { emitNotificationEvent } = require('../../src/common/notification-emitter') as typeof import('../../src/common/notification-emitter');
    emitNotificationEvent(params.userId, formatted);
  } catch {
    // Socket not available in serverless express path
  }
  return formatted;
}

export async function notifyAdmins(
  prisma: PrismaClient,
  params: Omit<Parameters<typeof createNotification>[1], 'userId'>,
) {
  const admins = await prisma.user.findMany({
    where: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
    select: { id: true },
  });
  const results = await Promise.all(
    admins.map((admin) => createNotification(prisma, { ...params, userId: admin.id })),
  );
  return results;
}

export async function listNotifications(
  prisma: PrismaClient,
  userId: string,
  query: { page?: number; limit?: number; type?: string; unread?: boolean } = {},
) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, query.limit ?? 20);
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = { user_id: userId };
  if (query.type) where.type = query.type;
  if (query.unread) where.is_read = false;

  const [rows, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { user_id: userId, is_read: false } }),
  ]);

  return {
    data: rows.map(formatNotification),
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function markNotificationRead(prisma: PrismaClient, userId: string, id: string) {
  const row = await prisma.notification.findUnique({ where: { id } });
  if (!row || row.user_id !== userId) return null;
  const updated = await prisma.notification.update({
    where: { id },
    data: { is_read: true },
  });
  return formatNotification(updated);
}

export async function markAllNotificationsRead(prisma: PrismaClient, userId: string) {
  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });
  return { success: true };
}

export async function getUnreadCount(prisma: PrismaClient, userId: string) {
  const count = await prisma.notification.count({
    where: { user_id: userId, is_read: false },
  });
  return { count };
}
