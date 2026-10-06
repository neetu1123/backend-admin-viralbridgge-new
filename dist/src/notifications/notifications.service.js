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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = exports.APPROACH_NOTIFICATION_TYPES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_emitter_1 = require("../common/notification-emitter");
exports.APPROACH_NOTIFICATION_TYPES = ['CAMPAIGN_INVITE', 'CAMPAIGN_APPLICATION'];
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    format(row) {
        return {
            id: row.id,
            user_id: row.user_id,
            type: row.type,
            title: row.title,
            message: row.body,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            is_read: row.is_read,
            is_dismissed: Boolean(row.is_dismissed),
            created_at: row.created_at,
            metadata: row.metadata ?? null,
        };
    }
    isApproachNotification(row) {
        if (exports.APPROACH_NOTIFICATION_TYPES.includes(row.type)) {
            return true;
        }
        const title = row.title.toLowerCase();
        const body = row.body.toLowerCase();
        return (title.includes('campaign invitation') ||
            title.includes('new campaign application') ||
            body.includes('invited to apply') ||
            /\bapplied to\b/.test(body));
    }
    async shouldNotify(userId, settingKey) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { settings: true },
        });
        const settings = user?.settings ?? {};
        return settings[settingKey] !== false;
    }
    async create(params) {
        const row = await this.prisma.notification.create({
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
        const formatted = this.format(row);
        (0, notification_emitter_1.emitNotificationEvent)(params.userId, formatted);
        return formatted;
    }
    async notifyAdmins(params) {
        const admins = await this.prisma.user.findMany({
            where: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
            select: { id: true },
        });
        return Promise.all(admins.map((admin) => this.create({ ...params, userId: admin.id })));
    }
    async list(userId, query = {}) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(50, query.limit ?? 20);
        const skip = (page - 1) * limit;
        const where = { user_id: userId };
        if (query.type)
            where.type = query.type;
        if (query.unread)
            where.is_read = false;
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
    async listBanner(userId, limit = 5) {
        const take = Math.min(8, Math.max(1, limit));
        const rows = await this.prisma.notification.findMany({
            where: { user_id: userId, is_read: false, is_dismissed: false },
            orderBy: { created_at: 'desc' },
            take: 40,
        });
        const data = rows.filter((row) => this.isApproachNotification(row)).slice(0, take).map((row) => this.format(row));
        return { data };
    }
    async markRead(userId, id) {
        const row = await this.prisma.notification.findUnique({ where: { id } });
        if (!row || row.user_id !== userId)
            return null;
        const updated = await this.prisma.notification.update({
            where: { id },
            data: { is_read: true, is_dismissed: true },
        });
        return this.format(updated);
    }
    async dismiss(userId, id) {
        const row = await this.prisma.notification.findUnique({ where: { id } });
        if (!row || row.user_id !== userId)
            return null;
        const updated = await this.prisma.notification.update({
            where: { id },
            data: { is_dismissed: true },
        });
        return this.format(updated);
    }
    async markAllRead(userId) {
        await this.prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true, is_dismissed: true },
        });
        return { success: true };
    }
    async unreadCount(userId) {
        const count = await this.prisma.notification.count({ where: { user_id: userId, is_read: false } });
        return { count };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map