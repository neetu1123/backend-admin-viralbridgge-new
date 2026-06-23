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
const firebase_admin_config_1 = require("../firebase/firebase-admin.config");
let FirebaseSecurityService = FirebaseSecurityService_1 = class FirebaseSecurityService {
    logger = new common_1.Logger(FirebaseSecurityService_1.name);
    getAuth() {
        if (!(0, firebase_admin_config_1.isFirebaseConfigured)()) {
            throw new common_1.BadRequestException('Firebase is not configured on this server');
        }
        (0, firebase_admin_config_1.initializeFirebaseAdmin)();
        return (0, firebase_admin_config_1.getFirebaseAuth)();
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
        const auth = this.getAuth();
        try {
            await auth.getUserByEmail(email);
        }
        catch {
            throw new common_1.BadRequestException('No Firebase account found for this email');
        }
        await auth.generatePasswordResetLink(email);
        this.logger.warn('FIREBASE_WEB_API_KEY is not set; password reset link generated but email was not sent automatically.');
    }
    async revokeAllRefreshTokens(firebaseUid) {
        await this.getAuth().revokeRefreshTokens(firebaseUid);
    }
    async isMfaEnrolled(firebaseUid) {
        const record = await this.getAuth().getUser(firebaseUid);
        return (record.multiFactor?.enrolledFactors?.length ?? 0) > 0;
    }
    async getMfaEnrollmentId(firebaseUid) {
        const record = await this.getAuth().getUser(firebaseUid);
        const factor = record.multiFactor?.enrolledFactors?.[0];
        return factor?.uid ?? null;
    }
    async ensureFirebaseUser(params) {
        if (params.firebaseUid)
            return params.firebaseUid;
        const auth = this.getAuth();
        try {
            const existing = await auth.getUserByEmail(params.email);
            return existing.uid;
        }
        catch {
            const created = await auth.createUser({
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