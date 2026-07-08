"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const security_emitter_1 = require("../common/security-emitter");
const firebase_security_service_1 = require("./firebase-security.service");
const security_constants_1 = require("./security.constants");
const security_session_helper_1 = require("./security-session.helper");
let SecurityService = class SecurityService {
    prisma;
    notifications;
    firebaseSecurity;
    constructor(prisma, notifications, firebaseSecurity) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.firebaseSecurity = firebaseSecurity;
    }
    async getSettings(userId) {
        const [settings, activeSessionCount] = await Promise.all([
            this.ensureSecuritySettings(userId),
            this.prisma.userSession.count({ where: { user_id: userId, is_active: true } }),
        ]);
        return {
            twoFactorEnabled: settings.two_factor_enabled,
            twoFactorType: settings.two_factor_type,
            phoneNumber: settings.phone_number,
            lastPasswordChange: settings.last_password_change?.toISOString() ?? null,
            activeSessionCount,
        };
    }
    async get2FaStatus(userId) {
        const settings = await this.ensureSecuritySettings(userId);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        let firebaseEnrolled = false;
        if (user?.firebase_uid) {
            try {
                firebaseEnrolled = await this.firebaseSecurity.isMfaEnrolled(user.firebase_uid);
            }
            catch {
                firebaseEnrolled = false;
            }
        }
        return {
            enabled: settings.two_factor_enabled,
            type: settings.two_factor_type,
            phoneNumber: settings.phone_number,
            pendingEnrollment: Boolean(settings.phone_number && !settings.two_factor_enabled && !firebaseEnrolled),
            firebaseMfaEnrolled: firebaseEnrolled,
        };
    }
    async changePassword(userId, dto, meta) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.password) {
            throw new common_1.BadRequestException('This account has no password set. Use forgot password on the login page.');
        }
        const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isCurrentValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        if (dto.currentPassword === dto.newPassword) {
            throw new common_1.BadRequestException('New password must be different from your current password');
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        if (user.firebase_uid) {
            try {
                await this.firebaseSecurity.updateUserPassword(user.firebase_uid, dto.newPassword);
            }
            catch {
            }
        }
        await this.prisma.securitySetting.upsert({
            where: { user_id: userId },
            update: { last_password_change: new Date() },
            create: { user_id: userId, last_password_change: new Date() },
        });
        await this.createAuditLog(userId, security_constants_1.SECURITY_AUDIT_ACTIONS.PASSWORD_CHANGED, meta);
        await this.recordActivity(userId, 'PASSWORD_CHANGED', meta);
        await this.notify(userId, 'Password updated', 'Your password was changed successfully.', 'SECURITY');
        return { message: 'Password changed successfully.' };
    }
    async deactivateAccount(userId, dto, meta) {
        if (dto.confirmation !== 'DELETE') {
            throw new common_1.BadRequestException('Type DELETE to confirm account deactivation');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.is_deleted) {
            throw new common_1.BadRequestException('Account is already deactivated');
        }
        if (user.password) {
            const isValid = await bcrypt.compare(dto.currentPassword, user.password);
            if (!isValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                is_deleted: true,
                status: 'DEACTIVATED',
            },
        });
        await this.prisma.userSession.updateMany({
            where: { user_id: userId, is_active: true },
            data: { is_active: false },
        });
        await this.createAuditLog(userId, 'ACCOUNT_DEACTIVATED', meta);
        await this.recordActivity(userId, 'ACCOUNT_DEACTIVATED', meta);
        return { message: 'Account deactivated successfully.' };
    }
    async enable2Fa(userId, dto, meta) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let firebaseUid = user.firebase_uid;
        if (!firebaseUid) {
            firebaseUid = await this.firebaseSecurity.ensureFirebaseUser({
                email: user.email,
                name: user.name,
                firebaseUid: user.firebase_uid,
            });
            await this.prisma.user.update({
                where: { id: userId },
                data: { firebase_uid: firebaseUid },
            });
        }
        const enrolled = await this.firebaseSecurity.isMfaEnrolled(firebaseUid);
        const enrollmentId = enrolled ? await this.firebaseSecurity.getMfaEnrollmentId(firebaseUid) : null;
        const settings = await this.prisma.securitySetting.upsert({
            where: { user_id: userId },
            update: {
                phone_number: dto.phoneNumber,
                two_factor_type: 'SMS',
                two_factor_enabled: enrolled,
                mfa_enrollment_id: enrollmentId,
            },
            create: {
                user_id: userId,
                phone_number: dto.phoneNumber,
                two_factor_type: 'SMS',
                two_factor_enabled: enrolled,
                mfa_enrollment_id: enrollmentId,
            },
        });
        if (enrolled) {
            await this.createAuditLog(userId, security_constants_1.SECURITY_AUDIT_ACTIONS.TWO_FA_ENABLED, meta);
            await this.recordActivity(userId, '2FA_ENABLED', meta);
            await this.notify(userId, '2FA enabled', 'Two-factor authentication is now active on your account.', 'SECURITY');
        }
        return {
            enabled: settings.two_factor_enabled,
            pendingEnrollment: !settings.two_factor_enabled,
            message: settings.two_factor_enabled
                ? 'Two-factor authentication enabled.'
                : 'Phone number saved. Complete MFA enrollment in Firebase, then call POST /security/2fa/confirm.',
        };
    }
    async confirm2Fa(userId, _dto, meta) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.firebase_uid) {
            throw new common_1.BadRequestException('Firebase account required to confirm 2FA');
        }
        const enrolled = await this.firebaseSecurity.isMfaEnrolled(user.firebase_uid);
        if (!enrolled) {
            throw new common_1.BadRequestException('Firebase MFA is not enrolled yet. Complete enrollment on the client first.');
        }
        const enrollmentId = await this.firebaseSecurity.getMfaEnrollmentId(user.firebase_uid);
        const settings = await this.prisma.securitySetting.update({
            where: { user_id: userId },
            data: {
                two_factor_enabled: true,
                two_factor_type: 'SMS',
                mfa_enrollment_id: enrollmentId,
            },
        });
        await this.createAuditLog(userId, security_constants_1.SECURITY_AUDIT_ACTIONS.TWO_FA_ENABLED, meta);
        await this.recordActivity(userId, '2FA_ENABLED', meta);
        await this.notify(userId, '2FA enabled', 'Two-factor authentication is now active on your account.', 'SECURITY');
        return {
            enabled: settings.two_factor_enabled,
            type: settings.two_factor_type,
            phoneNumber: settings.phone_number,
        };
    }
    async disable2Fa(userId, meta) {
        const settings = await this.ensureSecuritySettings(userId);
        if (!settings.two_factor_enabled) {
            throw new common_1.BadRequestException('Two-factor authentication is not enabled');
        }
        await this.prisma.securitySetting.update({
            where: { user_id: userId },
            data: {
                two_factor_enabled: false,
                mfa_enrollment_id: null,
            },
        });
        await this.createAuditLog(userId, security_constants_1.SECURITY_AUDIT_ACTIONS.TWO_FA_DISABLED, meta);
        await this.recordActivity(userId, '2FA_DISABLED', meta);
        await this.notify(userId, '2FA disabled', 'Two-factor authentication has been disabled. Disable MFA in Firebase on the client as well.', 'SECURITY');
        return { enabled: false, message: 'Two-factor authentication disabled.' };
    }
    async listSessions(userId, currentSessionToken) {
        const sessions = await this.prisma.userSession.findMany({
            where: { user_id: userId, is_active: true },
            orderBy: { last_active: 'desc' },
        });
        return sessions.map((s) => this.formatSession(s, currentSessionToken));
    }
    async removeSession(userId, sessionId, currentSessionToken, meta) {
        const session = await this.prisma.userSession.findFirst({
            where: { id: sessionId, user_id: userId, is_active: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.session_token && currentSessionToken && session.session_token === currentSessionToken) {
            throw new common_1.BadRequestException('Cannot remove your current session');
        }
        await this.prisma.userSession.update({
            where: { id: session.id },
            data: { is_active: false },
        });
        if (session.session_token) {
            await this.prisma.revokedToken.upsert({
                where: { jti: session.session_token },
                update: {},
                create: {
                    jti: session.session_token,
                    user_id: userId,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        }
        await this.createAuditLog(userId, security_constants_1.SECURITY_AUDIT_ACTIONS.SESSION_REMOVED, meta, {
            sessionId: session.id,
        });
        await this.recordActivity(userId, 'SESSION_REMOVED', meta ?? {}, {
            sessionId: session.id,
            device: session.device_name,
        });
        await this.notify(userId, 'Session removed', 'A device session was removed from your account.', 'SECURITY');
        return { removed: true, sessionId: session.id };
    }
    async signOutAll(userId, dto, currentSessionToken, meta) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const sessions = await this.prisma.userSession.findMany({
            where: { user_id: userId, is_active: true },
        });
        const keepCurrent = dto.signOutCurrentDevice !== true;
        const toRevoke = sessions.filter((s) => !keepCurrent || !s.session_token || s.session_token !== currentSessionToken);
        if (toRevoke.length === 0) {
            return { signedOut: 0, message: 'No sessions to sign out.' };
        }
        await this.prisma.userSession.updateMany({
            where: { id: { in: toRevoke.map((s) => s.id) } },
            data: { is_active: false },
        });
        for (const session of toRevoke) {
            if (!session.session_token)
                continue;
            await this.prisma.revokedToken.upsert({
                where: { jti: session.session_token },
                update: {},
                create: {
                    jti: session.session_token,
                    user_id: userId,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        }
        if (user.firebase_uid) {
            try {
                await this.firebaseSecurity.revokeAllRefreshTokens(user.firebase_uid);
            }
            catch {
            }
        }
        await this.createAuditLog(userId, security_constants_1.SECURITY_AUDIT_ACTIONS.LOGOUT_ALL, meta, {
            sessionCount: toRevoke.length,
        });
        await this.recordActivity(userId, 'LOGOUT_ALL', meta ?? {}, { sessionCount: toRevoke.length });
        await this.notify(userId, 'Signed out everywhere', `${toRevoke.length} session(s) were signed out on your account.`, 'SECURITY');
        return {
            signedOut: toRevoke.length,
            message: 'Signed out of all selected devices.',
        };
    }
    async listActivity(userId, query) {
        const page = query.page ?? 1;
        const limit = Math.min(50, query.limit ?? 20);
        const skip = (page - 1) * limit;
        const [rows, total] = await Promise.all([
            this.prisma.securityActivity.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.securityActivity.count({ where: { user_id: userId } }),
        ]);
        return {
            data: rows.map((row) => this.formatActivity(row)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async recordLogin(userId, sessionToken, meta) {
        const { deviceName, browser } = (0, security_session_helper_1.parseUserAgent)(meta.userAgent);
        if (sessionToken) {
            await this.prisma.userSession.create({
                data: {
                    user_id: userId,
                    session_token: sessionToken,
                    device_name: deviceName,
                    browser,
                    ip_address: meta.ipAddress,
                    location: meta.location ?? 'Unknown',
                    is_active: true,
                    last_active: new Date(),
                },
            });
        }
        await this.recordActivity(userId, 'NEW_LOGIN', meta, {}, false);
        await this.notify(userId, 'New login', 'A new login was detected on your account.', 'SECURITY');
    }
    async ensureSecuritySettings(userId) {
        return this.prisma.securitySetting.upsert({
            where: { user_id: userId },
            update: {},
            create: { user_id: userId },
        });
    }
    async recordActivity(userId, type, meta, extra = {}, emitSocket = true) {
        const { deviceName, browser } = (0, security_session_helper_1.parseUserAgent)(meta.userAgent);
        const activity = await this.prisma.securityActivity.create({
            data: {
                user_id: userId,
                type,
                device: deviceName,
                browser,
                ip_address: meta.ipAddress,
                location: meta.location ?? 'Unknown',
                metadata: extra,
            },
        });
        const formatted = this.formatActivity(activity);
        if (emitSocket) {
            (0, security_emitter_1.emitSecurityActivityEvent)(userId, formatted);
        }
        return formatted;
    }
    async notify(userId, title, message, type) {
        await this.notifications.create({
            userId,
            title,
            message,
            type,
            entityType: 'Security',
        });
    }
    async createAuditLog(userId, action, meta, extra) {
        try {
            const { deviceName, browser } = (0, security_session_helper_1.parseUserAgent)(meta?.userAgent);
            await this.prisma.auditLog.create({
                data: {
                    admin_id: userId,
                    action,
                    entity: 'Security',
                    entity_id: userId,
                    metadata: {
                        ip_address: meta?.ipAddress,
                        device: deviceName,
                        browser,
                        ...extra,
                    },
                },
            });
        }
        catch (error) {
            console.error('Security audit log failed:', error);
        }
    }
    formatSession(session, currentSessionToken) {
        return {
            id: session.id,
            deviceName: session.device_name,
            browser: session.browser,
            ipAddress: session.ip_address,
            location: session.location,
            isActive: session.is_active,
            isCurrent: Boolean(session.session_token && currentSessionToken && session.session_token === currentSessionToken),
            lastActive: session.last_active.toISOString(),
            createdAt: session.created_at.toISOString(),
        };
    }
    formatActivity(row) {
        return {
            id: row.id,
            type: row.type,
            label: security_constants_1.SECURITY_ACTIVITY_LABELS[row.type] ?? row.type,
            device: row.device,
            browser: row.browser,
            ipAddress: row.ip_address,
            location: row.location,
            createdAt: row.created_at.toISOString(),
        };
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        firebase_security_service_1.FirebaseSecurityService])
], SecurityService);
//# sourceMappingURL=security.service.js.map