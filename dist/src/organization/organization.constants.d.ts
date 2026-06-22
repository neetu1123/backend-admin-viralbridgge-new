export declare const ORGANIZATION_TYPES: readonly ["BRAND", "CREATOR"];
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];
export declare const BRAND_ORG_ROLES: readonly ["OWNER", "CAMPAIGN_MANAGER", "FINANCE_MANAGER", "VIEWER"];
export declare const CREATOR_ORG_ROLES: readonly ["OWNER", "MANAGER", "EDITOR", "FINANCE_MANAGER", "VIEWER"];
export type BrandOrgRole = (typeof BRAND_ORG_ROLES)[number];
export type CreatorOrgRole = (typeof CREATOR_ORG_ROLES)[number];
export type OrgRole = BrandOrgRole | CreatorOrgRole;
export declare const ORG_ROLE_LABELS: Record<string, string>;
export declare const ORG_ROLE_PERMISSIONS: Record<OrganizationType, Record<string, string[]>>;
export declare const INVITATION_EXPIRY_DAYS = 7;
export declare const INVITATION_STATUSES: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly EXPIRED: "EXPIRED";
    readonly REVOKED: "REVOKED";
};
export declare function rolesForOrgType(type: OrganizationType): readonly string[];
export declare function isValidOrgRole(type: OrganizationType, role: string): boolean;
export declare function permissionsForRole(type: OrganizationType, role: string): string[];
