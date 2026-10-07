import { isFullAccessUser, normalizeFeatureAccess, publicAuthUser } from './feature-access';

describe('feature-access', () => {
  it('treats missing access as limited', () => {
    expect(normalizeFeatureAccess(undefined)).toBe('LIMITED');
    expect(isFullAccessUser({ feature_access: 'LIMITED', role: { name: 'BRAND' } })).toBe(false);
  });

  it('unlocks admins even when the account is limited', () => {
    expect(isFullAccessUser({ feature_access: 'LIMITED', role: { name: 'ADMIN' } })).toBe(true);
  });

  it('returns a public auth payload without secrets', () => {
    expect(
      publicAuthUser({
        id: 'u1',
        name: 'Brand',
        email: 'brand@example.com',
        role: { name: 'BRAND' },
        feature_access: 'FULL',
        access_requested_at: null,
      }),
    ).toEqual({
      id: 'u1',
      name: 'Brand',
      email: 'brand@example.com',
      role: 'BRAND',
      feature_access: 'FULL',
      access_requested_at: null,
    });
  });
});
