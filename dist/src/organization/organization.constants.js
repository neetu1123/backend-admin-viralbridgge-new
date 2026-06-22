"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVITATION_STATUSES = exports.INVITATION_EXPIRY_DAYS = exports.ORG_ROLE_PERMISSIONS = exports.ORG_ROLE_LABELS = exports.CREATOR_ORG_ROLES = exports.BRAND_ORG_ROLES = exports.ORGANIZATION_TYPES = void 0;
exports.rolesForOrgType = rolesForOrgType;
exports.isValidOrgRole = isValidOrgRole;
exports.permissionsForRole = permissionsForRole;
exports.ORGANIZATION_TYPES = ['BRAND', 'CREATOR'];
exports.BRAND_ORG_ROLES = ['OWNER', 'CAMPAIGN_MANAGER', 'FINANCE_MANAGER', 'VIEWER'];
exports.CREATOR_ORG_ROLES = ['OWNER', 'MANAGER', 'EDITOR', 'FINANCE_MANAGER', 'VIEWER'];
exports.ORG_ROLE_LABELS = {
    OWNER: 'Owner',
    CAMPAIGN_MANAGER: 'Campaign Manager',
    FINANCE_MANAGER: 'Finance Manager',
    MANAGER: 'Manager',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
};
exports.ORG_ROLE_PERMISSIONS = {
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
exports.INVITATION_EXPIRY_DAYS = 7;
exports.INVITATION_STATUSES = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    EXPIRED: 'EXPIRED',
    REVOKED: 'REVOKED',
};
function rolesForOrgType(type) {
    return type === 'BRAND' ? exports.BRAND_ORG_ROLES : exports.CREATOR_ORG_ROLES;
}
function isValidOrgRole(type, role) {
    return rolesForOrgType(type).includes(role) && role !== 'OWNER';
}
function permissionsForRole(type, role) {
    return exports.ORG_ROLE_PERMISSIONS[type][role] ?? [];
}
//# sourceMappingURL=organization.constants.js.map