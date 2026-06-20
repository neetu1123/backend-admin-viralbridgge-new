import { BadRequestException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FirebaseSecurityService {
  private readonly logger = new Logger(FirebaseSecurityService.name);

  private async getAdmin() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
    if (!serviceAccountJson) {
      throw new BadRequestException('Firebase is not configured on this server');
    }
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(serviceAccountJson) as import('firebase-admin').ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    return admin;
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

    const admin = await this.getAdmin();
    try {
      await admin.auth().getUserByEmail(email);
    } catch {
      throw new BadRequestException('No Firebase account found for this email');
    }
    await admin.auth().generatePasswordResetLink(email);
    this.logger.warn(
      'FIREBASE_WEB_API_KEY is not set; password reset link generated but email was not sent automatically.',
    );
  }

  async revokeAllRefreshTokens(firebaseUid: string): Promise<void> {
    const admin = await this.getAdmin();
    await admin.auth().revokeRefreshTokens(firebaseUid);
  }

  async isMfaEnrolled(firebaseUid: string): Promise<boolean> {
    const admin = await this.getAdmin();
    const record = await admin.auth().getUser(firebaseUid);
    return (record.multiFactor?.enrolledFactors?.length ?? 0) > 0;
  }

  async getMfaEnrollmentId(firebaseUid: string): Promise<string | null> {
    const admin = await this.getAdmin();
    const record = await admin.auth().getUser(firebaseUid);
    const factor = record.multiFactor?.enrolledFactors?.[0];
    return factor?.uid ?? null;
  }

  async ensureFirebaseUser(params: {
    email: string;
    name: string;
    firebaseUid?: string | null;
  }): Promise<string> {
    if (params.firebaseUid) return params.firebaseUid;

    const admin = await this.getAdmin();
    try {
      const existing = await admin.auth().getUserByEmail(params.email);
      return existing.uid;
    } catch {
      const created = await admin.auth().createUser({
        email: params.email,
        displayName: params.name,
        emailVerified: false,
      });
      return created.uid;
    }
  }
}
