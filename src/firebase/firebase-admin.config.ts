import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import type { ServiceAccount } from 'firebase-admin';

export function isFirebaseConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim());
}

export function initializeFirebaseAdmin(): App | null {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!serviceAccountJson) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('FIREBASE_SERVICE_ACCOUNT is invalid JSON; Firebase auth disabled.', error);
    return null;
  }
}

export function getFirebaseAuth(): Auth {
  const app = initializeFirebaseAdmin();
  if (!app) {
    throw new Error('Firebase is not configured on this server');
  }
  return getAuth(app);
}
