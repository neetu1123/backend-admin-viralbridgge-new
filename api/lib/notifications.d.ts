import type { PrismaClient } from '@prisma/client';
export type NotificationType = 'SYSTEM' | 'KYC' | 'CAMPAIGN' | 'APPLICATION' | 'PAYMENT' | 'WITHDRAWAL' | 'DISPUTE' | 'MESSAGE';
export declare function formatNotification(row: {
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
}): {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    entity_type: string | null;
    entity_id: string | null;
    is_read: boolean;
    created_at: Date;
    metadata: {} | null;
};
export declare function createNotification(prisma: PrismaClient, params: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
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
    created_at: Date;
    metadata: {} | null;
}>;
export declare function notifyAdmins(prisma: PrismaClient, params: Omit<Parameters<typeof createNotification>[1], 'userId'>): Promise<{
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    entity_type: string | null;
    entity_id: string | null;
    is_read: boolean;
    created_at: Date;
    metadata: {} | null;
}[]>;
export declare function listNotifications(prisma: PrismaClient, userId: string, query?: {
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
        created_at: Date;
        metadata: {} | null;
    }[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export declare function markNotificationRead(prisma: PrismaClient, userId: string, id: string): Promise<{
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    entity_type: string | null;
    entity_id: string | null;
    is_read: boolean;
    created_at: Date;
    metadata: {} | null;
} | null>;
export declare function markAllNotificationsRead(prisma: PrismaClient, userId: string): Promise<{
    success: boolean;
}>;
export declare function getUnreadCount(prisma: PrismaClient, userId: string): Promise<{
    count: number;
}>;
