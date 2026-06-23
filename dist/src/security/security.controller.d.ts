import { Confirm2FaDto, ChangePasswordDto, Enable2FaDto, SecurityActivityQueryDto, SignOutAllDto } from './security.dto';
import { SecurityService } from './security.service';
type SecurityRequest = {
    user: {
        id: string;
    };
    jwtPayload?: {
        jti?: string;
    };
    headers: Record<string, string | string[] | undefined>;
};
export declare class SecurityController {
    private readonly securityService;
    constructor(securityService: SecurityService);
    getSettings(req: SecurityRequest): Promise<{
        twoFactorEnabled: boolean;
        twoFactorType: string | null;
        phoneNumber: string | null;
        lastPasswordChange: string | null;
        activeSessionCount: number;
    }>;
    changePassword(req: SecurityRequest, body: ChangePasswordDto): Promise<{
        message: string;
    }>;
    get2FaStatus(req: SecurityRequest): Promise<{
        enabled: boolean;
        type: string | null;
        phoneNumber: string | null;
        pendingEnrollment: boolean;
        firebaseMfaEnrolled: boolean;
    }>;
    enable2Fa(req: SecurityRequest, body: Enable2FaDto): Promise<{
        enabled: boolean;
        pendingEnrollment: boolean;
        message: string;
    }>;
    confirm2Fa(req: SecurityRequest, body: Confirm2FaDto): Promise<{
        enabled: boolean;
        type: string | null;
        phoneNumber: string | null;
    }>;
    disable2Fa(req: SecurityRequest): Promise<{
        enabled: boolean;
        message: string;
    }>;
    listSessions(req: SecurityRequest): Promise<{
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
    removeSession(req: SecurityRequest, id: string): Promise<{
        removed: boolean;
        sessionId: string;
    }>;
    signOutAll(req: SecurityRequest, body: SignOutAllDto): Promise<{
        signedOut: number;
        message: string;
    }>;
    listActivity(req: SecurityRequest, query: SecurityActivityQueryDto): Promise<{
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
}
export {};
