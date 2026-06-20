"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FirebaseSecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseSecurityService = void 0;
const common_1 = require("@nestjs/common");
let FirebaseSecurityService = FirebaseSecurityService_1 = class FirebaseSecurityService {
    logger = new common_1.Logger(FirebaseSecurityService_1.name);
    async getAdmin() {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
        if (!serviceAccountJson) {
            throw new common_1.BadRequestException('Firebase is not configured on this server');
        }
        const admin = await import('firebase-admin');
        if (!admin.apps.length) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        }
        return admin;
    }
    async sendPasswordResetEmail(email) {
        const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
        if (apiKey) {
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
            });
            const body = (await response.json());
            if (!response.ok) {
                const message = body.error?.message ?? 'Failed to send password reset email';
                throw new common_1.BadRequestException(message);
            }
            return;
        }
        const admin = await this.getAdmin();
        try {
            await admin.auth().getUserByEmail(email);
        }
        catch {
            throw new common_1.BadRequestException('No Firebase account found for this email');
        }
        await admin.auth().generatePasswordResetLink(email);
        this.logger.warn('FIREBASE_WEB_API_KEY is not set; password reset link generated but email was not sent automatically.');
    }
    async revokeAllRefreshTokens(firebaseUid) {
        const admin = await this.getAdmin();
        await admin.auth().revokeRefreshTokens(firebaseUid);
    }
    async isMfaEnrolled(firebaseUid) {
        const admin = await this.getAdmin();
        const record = await admin.auth().getUser(firebaseUid);
        return (record.multiFactor?.enrolledFactors?.length ?? 0) > 0;
    }
    async getMfaEnrollmentId(firebaseUid) {
        const admin = await this.getAdmin();
        const record = await admin.auth().getUser(firebaseUid);
        const factor = record.multiFactor?.enrolledFactors?.[0];
        return factor?.uid ?? null;
    }
    async ensureFirebaseUser(params) {
        if (params.firebaseUid)
            return params.firebaseUid;
        const admin = await this.getAdmin();
        try {
            const existing = await admin.auth().getUserByEmail(params.email);
            return existing.uid;
        }
        catch {
            const created = await admin.auth().createUser({
                email: params.email,
                displayName: params.name,
                emailVerified: false,
            });
            return created.uid;
        }
    }
};
exports.FirebaseSecurityService = FirebaseSecurityService;
exports.FirebaseSecurityService = FirebaseSecurityService = FirebaseSecurityService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseSecurityService);
//# sourceMappingURL=firebase-security.service.js.map