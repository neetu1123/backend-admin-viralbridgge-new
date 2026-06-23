"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseConfigured = isFirebaseConfigured;
exports.initializeFirebaseAdmin = initializeFirebaseAdmin;
exports.getFirebaseAuth = getFirebaseAuth;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
function isFirebaseConfigured() {
    return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim());
}
function initializeFirebaseAdmin() {
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApps)()[0];
    }
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
    if (!serviceAccountJson) {
        return null;
    }
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        return (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccount),
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
//# sourceMappingURL=firebase-admin.config.js.map