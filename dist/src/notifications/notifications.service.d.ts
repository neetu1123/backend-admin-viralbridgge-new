import { PrismaService } from '../prisma/prisma.service';
export declare const APPROACH_NOTIFICATION_TYPES: readonly ["CAMPAIGN_INVITE", "CAMPAIGN_APPLICATION"];
type NotificationRow = {
    id: string;
    user_id: string;
    title: string;
    body: string;
    type: string;
    entity_type: string | null;
    entity_id: string | null;
    is_read: boolean;
    is_dismissed?: boolean;
    created_at: Date;
    metadata?: unknown;
};
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    format(row: NotificationRow): {
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        entity_type: string | null;
        entity_id: string | null;
        is_read: boolean;
        is_dismissed: boolean;
        created_at: Date;
        metadata: {} | null;
    };
    isApproachNotification(row: Pick<NotificationRow, 'type' | 'title' | 'body'>): boolean;
    shouldNotify(userId: string, settingKey: string): Promise<boolean>;
    create(params: {
        userId: string;
        title: string;
        message: string;
        type?: string;
        entityType?: string;
        entityId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<{
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        entity_type: string | null;
        entity_id: string | null;
        is_read: boolean;
        is_dismissed: boolean;
        created_at: Date;
        metadata: {} | null;
    }>;
    notifyAdmins(params: Omit<Parameters<NotificationsService['create']>[0], 'userId'>): Promise<{
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        entity_type: string | null;
        entity_id: string | null;
        is_read: boolean;
        is_dismissed: boolean;
        created_at: Date;
        metadata: {} | null;
    }[]>;
    list(userId: string, query?: {
        page?: number;
        limit?: number;
        type?: string;
        unread?: boolean;
    }): Promise<{
        data: {
            id: string;
            user_id: string;
            type: string;
            title: string;
            message: string;
            entity_type: string | null;
            entity_id: string | null;
            is_read: boolean;
            is_dismissed: boolean;
            created_at: Date;
            metadata: {} | null;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listBanner(userId: string, limit?: number): Promise<{
        data: {
            id: string;
            user_id: string;
            type: string;
            title: string;
            message: string;
            entity_type: string | null;
            entity_id: string | null;
            is_read: boolean;
            is_dismissed: boolean;
            created_at: Date;
            metadata: {} | null;
        }[];
    }>;
    markRead(userId: string, id: string): Promise<{
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        entity_type: string | null;
        entity_id: string | null;
        is_read: boolean;
        is_dismissed: boolean;
        created_at: Date;
        metadata: {} | null;
    } | null>;
    dismiss(userId: string, id: string): Promise<{
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        entity_type: string | null;
        entity_id: string | null;
        is_read: boolean;
        is_dismissed: boolean;
        created_at: Date;
        metadata: {} | null;
    } | null>;
    markAllRead(userId: string): Promise<{
        success: boolean;
    }>;
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
}
export {};
