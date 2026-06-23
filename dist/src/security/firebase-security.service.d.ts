export declare class FirebaseSecurityService {
    private readonly logger;
    private getAuth;
    sendPasswordResetEmail(email: string): Promise<void>;
    revokeAllRefreshTokens(firebaseUid: string): Promise<void>;
    isMfaEnrolled(firebaseUid: string): Promise<boolean>;
    getMfaEnrollmentId(firebaseUid: string): Promise<string | null>;
    ensureFirebaseUser(params: {
        email: string;
        name: string;
        firebaseUid?: string | null;
    }): Promise<string>;
}
