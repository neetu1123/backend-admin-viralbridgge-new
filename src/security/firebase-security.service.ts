import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getFirebaseAuth, isFirebaseConfigured, initializeFirebaseAdmin } from '../firebase/firebase-admin.config';

@Injectable()
export class FirebaseSecurityService {
  private readonly logger = new Logger(FirebaseSecurityService.name);

  private getAuth() {
    if (!isFirebaseConfigured()) {
      throw new BadRequestException('Firebase is not configured on this server');
    }
    initializeFirebaseAdmin();
    return getFirebaseAuth();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
    if (apiKey) {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
        },
      );
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        const message = body.error?.message ?? 'Failed to send password reset email';
        throw new BadRequestException(message);
      }
      return;
    }

    const auth = this.getAuth();
    try {
      await auth.getUserByEmail(email);
    } catch {
      throw new BadRequestException('No Firebase account found for this email');
    }
    await auth.generatePasswordResetLink(email);
    this.logger.warn(
      'FIREBASE_WEB_API_KEY is not set; password reset link generated but email was not sent automatically.',
    );
  }

  async revokeAllRefreshTokens(firebaseUid: string): Promise<void> {
    await this.getAuth().revokeRefreshTokens(firebaseUid);
  }

  async isMfaEnrolled(firebaseUid: string): Promise<boolean> {
    const record = await this.getAuth().getUser(firebaseUid);
    return (record.multiFactor?.enrolledFactors?.length ?? 0) > 0;
  }

  async getMfaEnrollmentId(firebaseUid: string): Promise<string | null> {
    const record = await this.getAuth().getUser(firebaseUid);
    const factor = record.multiFactor?.enrolledFactors?.[0];
    return factor?.uid ?? null;
  }

  async updateUserPassword(firebaseUid: string, newPassword: string): Promise<void> {
    await this.getAuth().updateUser(firebaseUid, { password: newPassword });
  }

  async ensureFirebaseUser(params: {
    email: string;
    name: string;
    firebaseUid?: string | null;
  }): Promise<string> {
    if (params.firebaseUid) return params.firebaseUid;

    const auth = this.getAuth();
    try {
      const existing = await auth.getUserByEmail(params.email);
      return existing.uid;
    } catch {
      const created = await auth.createUser({
        email: params.email,
        displayName: params.name,
        emailVerified: false,
      });
      return created.uid;
    }
  }
}
