import { type App } from 'firebase-admin/app';
import { type Auth } from 'firebase-admin/auth';
export declare function isFirebaseConfigured(): boolean;
export declare function initializeFirebaseAdmin(): App | null;
export declare function getFirebaseAuth(): Auth;
