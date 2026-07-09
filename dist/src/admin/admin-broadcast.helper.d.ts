import type { PrismaService } from '../prisma/prisma.service';
import type { EmailService } from '../email/email.service';
import type { NotificationsService } from '../notifications/notifications.service';
export type BroadcastAudience = 'everyone' | 'all' | 'creators' | 'brands' | 'admins';
export interface BroadcastFilters {
    state?: string;
    city?: string;
    language?: string;
    followersMin?: number;
    followersMax?: number;
    brandId?: string;
}
export interface BroadcastBody {
    subject: string;
    title: string;
    message: string;
    audience?: BroadcastAudience;
    sendInApp?: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
    filters?: BroadcastFilters;
}
export declare function sendAdminBroadcast(prisma: PrismaService, email: EmailService, notifications: NotificationsService, body: BroadcastBody, adminId?: string): Promise<{
    sent: number;
    failed: number;
    inApp: number;
    total: number;
    audience: BroadcastAudience;
    errors: string[];
}>;
