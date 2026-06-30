"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseConfigured = isFirebaseConfigured;
exports.getFirebaseStorageBucketName = getFirebaseStorageBucketName;
exports.initializeFirebaseAdmin = initializeFirebaseAdmin;
exports.getFirebaseAuth = getFirebaseAuth;
exports.getFirebaseStorage = getFirebaseStorage;
exports.getFirebaseBucket = getFirebaseBucket;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const storage_1 = require("firebase-admin/storage");
function isFirebaseConfigured() {
    return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim());
}
function parseServiceAccount() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
    if (!serviceAccountJson)
        return null;
    try {
        return JSON.parse(serviceAccountJson);
    }
    catch {
        return null;
    }
}
function getFirebaseStorageBucketName() {
    const explicit = process.env.FIREBASE_STORAGE_BUCKET?.trim();
    if (explicit)
        return explicit;
    const serviceAccount = parseServiceAccount();
    if (serviceAccount?.projectId) {
        return `${serviceAccount.projectId}.appspot.com`;
    }
    return undefined;
}
function initializeFirebaseAdmin() {
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApps)()[0];
    }
    const serviceAccount = parseServiceAccount();
    if (!serviceAccount) {
        return null;
    }
    try {
        const storageBucket = getFirebaseStorageBucketName();
        return (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccount),
            ...(storageBucket ? { storageBucket } : {}),
        });
    }
    catch (error) {
        console.error('FIREBASE_SERVICE_ACCOUNT is invalid JSON; Firebase auth disabled.', error);
        return null;
    }
}
function getFirebaseAuth() {
    const app = initializeFirebaseAdmin();
    if (!app) {
        throw new Error('Firebase is not configured on this server');
    }
    return (0, auth_1.getAuth)(app);
}
function getFirebaseStorage() {
    const app = initializeFirebaseAdmin();
    if (!app) {
        throw new Error('Firebase is not configured on this server');
    }
    return (0, storage_1.getStorage)(app);
}
function getFirebaseBucket() {
    const bucketName = getFirebaseStorageBucketName();
    if (!bucketName) {
        throw new Error('Firebase Storage bucket is not configured');
    }
    return getFirebaseStorage().bucket(bucketName);
}
//# sourceMappingURL=firebase-admin.config.js.map