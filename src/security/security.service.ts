import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { emitSecurityActivityEvent } from '../common/security-emitter';
import { FirebaseSecurityService } from './firebase-security.service';
import {
  SECURITY_ACTIVITY_LABELS,
  SECURITY_AUDIT_ACTIONS,
  SecurityActivityType,
} from './security.constants';
import { parseUserAgent, SessionMeta } from './security-session.helper';
import { Confirm2FaDto, ChangePasswordDto, Enable2FaDto, SecurityActivityQueryDto, SignOutAllDto } from './security.dto';

@Injectable()
export class SecurityService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private firebaseSecurity: FirebaseSecurityService,
  ) {}

  async getSettings(userId: string) {
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

  async get2FaStatus(userId: string) {
    const settings = await this.ensureSecuritySettings(userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    let firebaseEnrolled = false;
    if (user?.firebase_uid) {
      try {
        firebaseEnrolled = await this.firebaseSecurity.isMfaEnrolled(user.firebase_uid);
      } catch {
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

  async changePassword(userId: string, dto: ChangePasswordDto, meta: SessionMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.password) {
      throw new BadRequestException(
        'This account has no password set. Use forgot password on the login page.',
      );
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from your current password');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    if (user.firebase_uid) {
      try {
        await this.firebaseSecurity.updateUserPassword(user.firebase_uid, dto.newPassword);
      } catch {
        // JWT login still works if Firebase sync fails
      }
    }

    await this.prisma.securitySetting.upsert({
      where: { user_id: userId },
      update: { last_password_change: new Date() },
      create: { user_id: userId, last_password_change: new Date() },
    });

    await this.createAuditLog(userId, SECURITY_AUDIT_ACTIONS.PASSWORD_CHANGED, meta);
    await this.recordActivity(userId, 'PASSWORD_CHANGED', meta);
    await this.notify(userId, 'Password updated', 'Your password was changed successfully.', 'SECURITY');

    return { message: 'Password changed successfully.' };
  }

  async enable2Fa(userId: string, dto: Enable2FaDto, meta: SessionMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

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
      await this.createAuditLog(userId, SECURITY_AUDIT_ACTIONS.TWO_FA_ENABLED, meta);
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

  async confirm2Fa(userId: string, _dto: Confirm2FaDto, meta: SessionMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.firebase_uid) {
      throw new BadRequestException('Firebase account required to confirm 2FA');
    }

    const enrolled = await this.firebaseSecurity.isMfaEnrolled(user.firebase_uid);
    if (!enrolled) {
      throw new BadRequestException('Firebase MFA is not enrolled yet. Complete enrollment on the client first.');
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

    await this.createAuditLog(userId, SECURITY_AUDIT_ACTIONS.TWO_FA_ENABLED, meta);
    await this.recordActivity(userId, '2FA_ENABLED', meta);
    await this.notify(userId, '2FA enabled', 'Two-factor authentication is now active on your account.', 'SECURITY');

    return {
      enabled: settings.two_factor_enabled,
      type: settings.two_factor_type,
      phoneNumber: settings.phone_number,
    };
  }

  async disable2Fa(userId: string, meta: SessionMeta) {
    const settings = await this.ensureSecuritySettings(userId);
    if (!settings.two_factor_enabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    await this.prisma.securitySetting.update({
      where: { user_id: userId },
      data: {
        two_factor_enabled: false,
        mfa_enrollment_id: null,
      },
    });

    await this.createAuditLog(userId, SECURITY_AUDIT_ACTIONS.TWO_FA_DISABLED, meta);
    await this.recordActivity(userId, '2FA_DISABLED', meta);
    await this.notify(
      userId,
      '2FA disabled',
      'Two-factor authentication has been disabled. Disable MFA in Firebase on the client as well.',
      'SECURITY',
    );

    return { enabled: false, message: 'Two-factor authentication disabled.' };
  }

  async listSessions(userId: string, currentSessionToken?: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { user_id: userId, is_active: true },
      orderBy: { last_active: 'desc' },
    });

    return sessions.map((s) => this.formatSession(s, currentSessionToken));
  }

  async removeSession(userId: string, sessionId: string, currentSessionToken?: string, meta?: SessionMeta) {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, user_id: userId, is_active: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (session.session_token && currentSessionToken && session.session_token === currentSessionToken) {
      throw new BadRequestException('Cannot remove your current session');
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

    await this.createAuditLog(userId, SECURITY_AUDIT_ACTIONS.SESSION_REMOVED, meta, {
      sessionId: session.id,
    });
    await this.recordActivity(userId, 'SESSION_REMOVED', meta ?? {}, {
      sessionId: session.id,
      device: session.device_name,
    });
    await this.notify(userId, 'Session removed', 'A device session was removed from your account.', 'SECURITY');

    return { removed: true, sessionId: session.id };
  }

  async signOutAll(userId: string, dto: SignOutAllDto, currentSessionToken?: string, meta?: SessionMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const sessions = await this.prisma.userSession.findMany({
      where: { user_id: userId, is_active: true },
    });

    const keepCurrent = dto.signOutCurrentDevice !== true;
    const toRevoke = sessions.filter(
      (s) => !keepCurrent || !s.session_token || s.session_token !== currentSessionToken,
    );

    if (toRevoke.length === 0) {
      return { signedOut: 0, message: 'No sessions to sign out.' };
    }

    await this.prisma.userSession.updateMany({
      where: { id: { in: toRevoke.map((s) => s.id) } },
      data: { is_active: false },
    });

    for (const session of toRevoke) {
      if (!session.session_token) continue;
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
      } catch {
        // Non-fatal for JWT-only users
      }
    }

    await this.createAuditLog(userId, SECURITY_AUDIT_ACTIONS.LOGOUT_ALL, meta, {
      sessionCount: toRevoke.length,
    });
    await this.recordActivity(userId, 'LOGOUT_ALL', meta ?? {}, { sessionCount: toRevoke.length });
    await this.notify(
      userId,
      'Signed out everywhere',
      `${toRevoke.length} session(s) were signed out on your account.`,
      'SECURITY',
    );

    return {
      signedOut: toRevoke.length,
      message: 'Signed out of all selected devices.',
    };
  }

  async listActivity(userId: string, query: SecurityActivityQueryDto) {
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

  async recordLogin(userId: string, sessionToken: string | undefined, meta: SessionMeta) {
    const { deviceName, browser } = parseUserAgent(meta.userAgent);

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

  private async ensureSecuritySettings(userId: string) {
    return this.prisma.securitySetting.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });
  }

  private async recordActivity(
    userId: string,
    type: SecurityActivityType,
    meta: SessionMeta,
    extra: Record<string, unknown> = {},
    emitSocket = true,
  ) {
    const { deviceName, browser } = parseUserAgent(meta.userAgent);
    const activity = await this.prisma.securityActivity.create({
      data: {
        user_id: userId,
        type,
        device: deviceName,
        browser,
        ip_address: meta.ipAddress,
        location: meta.location ?? 'Unknown',
        metadata: extra as object,
      },
    });

    const formatted = this.formatActivity(activity);
    if (emitSocket) {
      emitSecurityActivityEvent(userId, formatted);
    }
    return formatted;
  }

  private async notify(userId: string, title: string, message: string, type: string) {
    await this.notifications.create({
      userId,
      title,
      message,
      type,
      entityType: 'Security',
    });
  }

  private async createAuditLog(
    userId: string,
    action: string,
    meta?: SessionMeta,
    extra?: Record<string, unknown>,
  ) {
    try {
      const { deviceName, browser } = parseUserAgent(meta?.userAgent);
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
          } as object,
        },
      });
    } catch (error) {
      console.error('Security audit log failed:', error);
    }
  }

  private formatSession(
    session: {
      id: string;
      device_name: string | null;
      browser: string | null;
      ip_address: string | null;
      location: string | null;
      is_active: boolean;
      last_active: Date;
      created_at: Date;
      session_token: string | null;
    },
    currentSessionToken?: string,
  ) {
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

  private formatActivity(row: {
    id: string;
    type: string;
    device: string | null;
    browser: string | null;
    ip_address: string | null;
    location: string | null;
    created_at: Date;
  }) {
    return {
      id: row.id,
      type: row.type,
      label: SECURITY_ACTIVITY_LABELS[row.type as SecurityActivityType] ?? row.type,
      device: row.device,
      browser: row.browser,
      ipAddress: row.ip_address,
      location: row.location,
      createdAt: row.created_at.toISOString(),
    };
  }
}
