import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FirebaseSecurityService } from './firebase-security.service';
import { SessionMeta } from './security-session.helper';
import { Confirm2FaDto, ChangePasswordDto, Enable2FaDto, SecurityActivityQueryDto, SignOutAllDto } from './security.dto';
export declare class SecurityService {
    private prisma;
    private notifications;
    private firebaseSecurity;
    constructor(prisma: PrismaService, notifications: NotificationsService, firebaseSecurity: FirebaseSecurityService);
    getSettings(userId: string): Promise<{
        twoFactorEnabled: boolean;
        twoFactorType: string | null;
        phoneNumber: string | null;
        lastPasswordChange: string | null;
        activeSessionCount: number;
    }>;
    get2FaStatus(userId: string): Promise<{
        enabled: boolean;
        type: string | null;
        phoneNumber: string | null;
        pendingEnrollment: boolean;
        firebaseMfaEnrolled: boolean;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto, meta: SessionMeta): Promise<{
        message: string;
    }>;
    enable2Fa(userId: string, dto: Enable2FaDto, meta: SessionMeta): Promise<{
        enabled: boolean;
        pendingEnrollment: boolean;
        message: string;
    }>;
    confirm2Fa(userId: string, _dto: Confirm2FaDto, meta: SessionMeta): Promise<{
        enabled: boolean;
        type: string | null;
        phoneNumber: string | null;
    }>;
    disable2Fa(userId: string, meta: SessionMeta): Promise<{
        enabled: boolean;
        message: string;
    }>;
    listSessions(userId: string, currentSessionToken?: string): Promise<{
        id: string;
        deviceName: string | null;
        browser: string | null;
        ipAddress: string | null;
        location: string | null;
        isActive: boolean;
        isCurrent: boolean;
        lastActive: string;
        createdAt: string;
    }[]>;
    removeSession(userId: string, sessionId: string, currentSessionToken?: string, meta?: SessionMeta): Promise<{
        removed: boolean;
        sessionId: string;
    }>;
    signOutAll(userId: string, dto: SignOutAllDto, currentSessionToken?: string, meta?: SessionMeta): Promise<{
        signedOut: number;
        message: string;
    }>;
    listActivity(userId: string, query: SecurityActivityQueryDto): Promise<{
        data: {
            id: string;
            type: string;
            label: string;
            device: string | null;
            browser: string | null;
            ipAddress: string | null;
            location: string | null;
            createdAt: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    recordLogin(userId: string, sessionToken: string | undefined, meta: SessionMeta): Promise<void>;
    private ensureSecuritySettings;
    private recordActivity;
    private notify;
    private createAuditLog;
    private formatSession;
    private formatActivity;
}
