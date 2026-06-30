import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import type { ServiceAccount } from 'firebase-admin';
import type { Bucket } from '@google-cloud/storage';

export function isFirebaseConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim());
}

function parseServiceAccount(): ServiceAccount | null {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!serviceAccountJson) return null;
  try {
    return JSON.parse(serviceAccountJson) as ServiceAccount;
  } catch {
    return null;
  }
}

export function getFirebaseStorageBucketName(): string | undefined {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (explicit) return explicit;
  const serviceAccount = parseServiceAccount();
  if (serviceAccount?.projectId) {
    return `${serviceAccount.projectId}.appspot.com`;
  }
  return undefined;
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
    throw new Error('Firebase Storage bucket is not configured');
  }
  return getFirebaseStorage().bucket(bucketName);
}
