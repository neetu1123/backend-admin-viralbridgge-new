export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class DeactivateAccountDto {
    currentPassword: string;
    confirmation: string;
}
export declare class Enable2FaDto {
    phoneNumber: string;
}
export declare class Confirm2FaDto {
    firebaseMfaCompleted?: boolean;
}
export declare class SignOutAllDto {
    signOutCurrentDevice?: boolean;
}
export declare class SecurityActivityQueryDto {
    page?: number;
    limit?: number;
}
export declare class SecuritySettingsResponseDto {
    twoFactorEnabled: boolean;
    twoFactorType?: string | null;
    phoneNumber?: string | null;
    lastPasswordChange?: string | null;
    activeSessionCount: number;
}
export declare class TwoFactorStatusResponseDto {
    enabled: boolean;
    type?: string | null;
    phoneNumber?: string | null;
    pendingEnrollment: boolean;
}
export declare class UserSessionResponseDto {
    id: string;
    deviceName?: string | null;
    browser?: string | null;
    ipAddress?: string | null;
    location?: string | null;
    isActive: boolean;
    isCurrent: boolean;
    lastActive: string;
    createdAt: string;
}
export declare class SecurityActivityResponseDto {
    id: string;
    type: string;
    label: string;
    device?: string | null;
    browser?: string | null;
    ipAddress?: string | null;
    location?: string | null;
    createdAt: string;
}
