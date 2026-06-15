import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { emitNotificationEvent } from '../common/notification-emitter';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  format(row: {
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

  async create(params: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }) {
    const row = await this.prisma.notification.create({
      data: {
        user_id: params.userId,
        title: params.title,
        body: params.message,
        type: params.type ?? 'SYSTEM',
        entity_type: params.entityType,
        entity_id: params.entityId,
        metadata: (params.metadata ?? {}) as object,
      },
    });
    const formatted = this.format(row);
    emitNotificationEvent(params.userId, formatted);
    return formatted;
  }

  async notifyAdmins(params: Omit<Parameters<NotificationsService['create']>[0], 'userId'>) {
    const admins = await this.prisma.user.findMany({
      where: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
      select: { id: true },
    });
    return Promise.all(admins.map((admin) => this.create({ ...params, userId: admin.id })));
  }

  async list(userId: string, query: { page?: number; limit?: number; type?: string; unread?: boolean } = {}) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, query.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { user_id: userId };
    if (query.type) where.type = query.type;
    if (query.unread) where.is_read = false;
    const [rows, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { user_id: userId, is_read: false } }),
    ]);
    return {
      data: rows.map((row) => this.format(row)),
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markRead(userId: string, id: string) {
    const row = await this.prisma.notification.findUnique({ where: { id } });
    if (!row || row.user_id !== userId) return null;
    const updated = await this.prisma.notification.update({ where: { id }, data: { is_read: true } });
    return this.format(updated);
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { user_id: userId, is_read: false } });
    return { count };
  }
}
