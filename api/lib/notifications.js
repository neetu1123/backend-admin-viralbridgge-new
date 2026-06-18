"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNotification = formatNotification;
exports.createNotification = createNotification;
exports.notifyAdmins = notifyAdmins;
exports.listNotifications = listNotifications;
exports.markNotificationRead = markNotificationRead;
exports.markAllNotificationsRead = markAllNotificationsRead;
exports.getUnreadCount = getUnreadCount;
function formatNotification(row) {
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
async function createNotification(prisma, params) {
    const notification = await prisma.notification.create({
        data: {
            user_id: params.userId,
            title: params.title,
            body: params.message,
            type: params.type ?? 'SYSTEM',
            entity_type: params.entityType,
            entity_id: params.entityId,
            metadata: (params.metadata ?? {}),
        },
    });
    const formatted = formatNotification(notification);
    try {
        const { emitNotificationEvent } = require('../../src/common/notification-emitter');
        emitNotificationEvent(params.userId, formatted);
    }
    catch {
    }
    return formatted;
}
async function notifyAdmins(prisma, params) {
    const admins = await prisma.user.findMany({
        where: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
        select: { id: true },
    });
    const results = await Promise.all(admins.map((admin) => createNotification(prisma, { ...params, userId: admin.id })));
    return results;
}
async function listNotifications(prisma, userId, query = {}) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, query.limit ?? 20);
    const skip = (page - 1) * limit;
    const where = { user_id: userId };
    if (query.type)
        where.type = query.type;
    if (query.unread)
        where.is_read = false;
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
async function markNotificationRead(prisma, userId, id) {
    const row = await prisma.notification.findUnique({ where: { id } });
    if (!row || row.user_id !== userId)
        return null;
    const updated = await prisma.notification.update({
        where: { id },
        data: { is_read: true },
    });
    return formatNotification(updated);
}
async function markAllNotificationsRead(prisma, userId) {
    await prisma.notification.updateMany({
        where: { user_id: userId, is_read: false },
        data: { is_read: true },
    });
    return { success: true };
}
async function getUnreadCount(prisma, userId) {
    const count = await prisma.notification.count({
        where: { user_id: userId, is_read: false },
    });
    return { count };
}
//# sourceMappingURL=notifications.js.map