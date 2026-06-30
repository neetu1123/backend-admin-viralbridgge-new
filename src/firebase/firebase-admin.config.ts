import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import type { ServiceAccount } from 'firebase-admin';
import type { Bucket } from '@google-cloud/storage';

function parseServiceAccount(): ServiceAccount | null {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!serviceAccountJson) return null;
  try {
    return JSON.parse(serviceAccountJson) as ServiceAccount;
  } catch {
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return Boolean(parseServiceAccount());
}

export function getFirebaseStorageBucketName(): string | undefined {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (explicit) return explicit.replace(/^gs:\/\//, '');

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount?.projectId) return undefined;

  // New Firebase projects often use .firebasestorage.app; legacy uses .appspot.com
  const override = process.env.FIREBASE_STORAGE_BUCKET_LEGACY?.trim();
  if (override === 'appspot') {
    return `${serviceAccount.projectId}.appspot.com`;
  }
  if (override === 'firebasestorage') {
    return `${serviceAccount.projectId}.firebasestorage.app`;
  }

  return `${serviceAccount.projectId}.firebasestorage.app`;
}

export function initializeFirebaseAdmin(): App | null {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  try {
    const storageBucket = getFirebaseStorageBucketName();
    return initializeApp({
      credential: cert(serviceAccount),
      ...(storageBucket ? { storageBucket } : {}),
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

export function getFirebaseStorage(): Storage {
  const app = initializeFirebaseAdmin();
  if (!app) {
    throw new Error('Firebase is not configured on this server');
  }
  return getStorage(app);
}

export function getFirebaseBucket(): Bucket {
  const bucketName = getFirebaseStorageBucketName();
  if (!bucketName) {
    throw new Error(
      'Firebase Storage bucket is not configured. Set FIREBASE_STORAGE_BUCKET on Vercel ' +
        '(Firebase Console → Storage → bucket name) and a valid FIREBASE_SERVICE_ACCOUNT JSON.',
    );
  }
  return getFirebaseStorage().bucket(bucketName);
}
