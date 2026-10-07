"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_ACCESS_FULL = exports.FEATURE_ACCESS_LIMITED = void 0;
exports.normalizeFeatureAccess = normalizeFeatureAccess;
exports.isPrivilegedRole = isPrivilegedRole;
exports.isFullAccessUser = isFullAccessUser;
exports.publicAuthUser = publicAuthUser;
exports.FEATURE_ACCESS_LIMITED = 'LIMITED';
exports.FEATURE_ACCESS_FULL = 'FULL';
function normalizeFeatureAccess(value) {
    return String(value ?? exports.FEATURE_ACCESS_LIMITED).toUpperCase() === exports.FEATURE_ACCESS_FULL
        ? exports.FEATURE_ACCESS_FULL
        : exports.FEATURE_ACCESS_LIMITED;
}
function isPrivilegedRole(roleName) {
    const role = String(roleName ?? '').toUpperCase();
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}
function isFullAccessUser(user) {
    if (!user)
        return false;
    if (isPrivilegedRole(user.role?.name))
        return true;
    return normalizeFeatureAccess(user.feature_access) === exports.FEATURE_ACCESS_FULL;
}
function publicAuthUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
        feature_access: normalizeFeatureAccess(user.feature_access),
        access_requested_at: user.access_requested_at ?? null,
    };
}
//# sourceMappingURL=feature-access.js.map