export const ORGANIZATION_TYPES = ['BRAND', 'CREATOR'] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const BRAND_ORG_ROLES = ['OWNER', 'CAMPAIGN_MANAGER', 'FINANCE_MANAGER', 'VIEWER'] as const;
export const CREATOR_ORG_ROLES = ['OWNER', 'MANAGER', 'EDITOR', 'FINANCE_MANAGER', 'VIEWER'] as const;

export type BrandOrgRole = (typeof BRAND_ORG_ROLES)[number];
export type CreatorOrgRole = (typeof CREATOR_ORG_ROLES)[number];
export type OrgRole = BrandOrgRole | CreatorOrgRole;

export const ORG_ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  CAMPAIGN_MANAGER: 'Campaign Manager',
  FINANCE_MANAGER: 'Finance Manager',
  MANAGER: 'Manager',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

export const ORG_ROLE_PERMISSIONS: Record<OrganizationType, Record<string, string[]>> = {
  BRAND: {
    OWNER: ['Invite & remove team members', 'Change member roles', 'Manage campaigns', 'Manage wallet & billing', 'View all analytics'],
    CAMPAIGN_MANAGER: ['Create & edit campaigns', 'Review applicants', 'Message creators', 'View campaign analytics'],
    FINANCE_MANAGER: ['Add funds & manage wallet', 'Release escrow', 'View billing & transactions', 'View financial reports'],
    VIEWER: ['View campaigns (read-only)', 'View team members', 'View analytics (read-only)'],
  },
  CREATOR: {
    OWNER: ['Invite & remove team members', 'Change member roles', 'Manage profile & portfolio', 'Manage applications', 'Manage payouts'],
    MANAGER: ['Manage profile updates', 'Submit & track applications', 'Message brands', 'View performance analytics'],
    EDITOR: ['Edit profile & portfolio', 'Upload deliverables', 'Update content & media kit'],
    FINANCE_MANAGER: ['View wallet & earnings', 'Request withdrawals', 'View transaction history'],
    VIEWER: ['View profile (read-only)', 'View applications (read-only)', 'View team members'],
  },
};

export const INVITATION_EXPIRY_DAYS = 7;

export function rolesForOrgType(type: OrganizationType): readonly string[] {
  return type === 'BRAND' ? BRAND_ORG_ROLES : CREATOR_ORG_ROLES;
}

export function isValidOrgRole(type: OrganizationType, role: string): boolean {
  return rolesForOrgType(type).includes(role) && role !== 'OWNER';
}

export function permissionsForRole(type: OrganizationType, role: string): string[] {
  return ORG_ROLE_PERMISSIONS[type][role] ?? [];
}
