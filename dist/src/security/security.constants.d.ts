export declare const SECURITY_ACTIVITY_TYPES: readonly ["NEW_LOGIN", "PASSWORD_CHANGED", "2FA_ENABLED", "2FA_DISABLED", "SESSION_REMOVED", "LOGOUT_ALL"];
export type SecurityActivityType = (typeof SECURITY_ACTIVITY_TYPES)[number];
export declare const SECURITY_AUDIT_ACTIONS: {
    readonly PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED";
    readonly TWO_FA_ENABLED: "2FA_ENABLED";
    readonly TWO_FA_DISABLED: "2FA_DISABLED";
    readonly SESSION_REMOVED: "SESSION_REMOVED";
    readonly LOGOUT_ALL: "LOGOUT_ALL";
};
export declare const SECURITY_ACTIVITY_LABELS: Record<SecurityActivityType, string>;
