export declare const FEATURE_ACCESS_LIMITED = "LIMITED";
export declare const FEATURE_ACCESS_FULL = "FULL";
export type FeatureAccess = typeof FEATURE_ACCESS_LIMITED | typeof FEATURE_ACCESS_FULL;
export declare function normalizeFeatureAccess(value?: string | null): FeatureAccess;
export declare function isPrivilegedRole(roleName?: string | null): boolean;
export declare function isFullAccessUser(user?: {
    feature_access?: string | null;
    role?: {
        name?: string;
    } | null;
} | null): boolean;
export declare function publicAuthUser(user: {
    id: string;
    name: string;
    email: string;
    role?: {
        name?: string;
    } | null;
    feature_access?: string | null;
    access_requested_at?: Date | null;
}): {
    id: string;
    name: string;
    email: string;
    role: string | undefined;
    feature_access: FeatureAccess;
    access_requested_at: Date | null;
};
