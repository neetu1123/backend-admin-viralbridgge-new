export const FEATURE_ACCESS_LIMITED = 'LIMITED';
export const FEATURE_ACCESS_FULL = 'FULL';

export type FeatureAccess = typeof FEATURE_ACCESS_LIMITED | typeof FEATURE_ACCESS_FULL;

export function normalizeFeatureAccess(value?: string | null): FeatureAccess {
  return String(value ?? FEATURE_ACCESS_LIMITED).toUpperCase() === FEATURE_ACCESS_FULL
    ? FEATURE_ACCESS_FULL
    : FEATURE_ACCESS_LIMITED;
}

export function isPrivilegedRole(roleName?: string | null): boolean {
  const role = String(roleName ?? '').toUpperCase();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isFullAccessUser(user?: {
  feature_access?: string | null;
  role?: { name?: string } | null;
} | null): boolean {
  if (!user) return false;
  if (isPrivilegedRole(user.role?.name)) return true;
  return normalizeFeatureAccess(user.feature_access) === FEATURE_ACCESS_FULL;
}

export function publicAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role?: { name?: string } | null;
  feature_access?: string | null;
  access_requested_at?: Date | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role?.name,
    feature_access: normalizeFeatureAccess(user.feature_access),
    access_requested_at: user.access_requested_at ?? null,
  };
}
