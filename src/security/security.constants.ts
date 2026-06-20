export const SECURITY_ACTIVITY_TYPES = [
  'NEW_LOGIN',
  'PASSWORD_CHANGED',
  '2FA_ENABLED',
  '2FA_DISABLED',
  'SESSION_REMOVED',
  'LOGOUT_ALL',
] as const;

export type SecurityActivityType = (typeof SECURITY_ACTIVITY_TYPES)[number];

export const SECURITY_AUDIT_ACTIONS = {
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  TWO_FA_ENABLED: '2FA_ENABLED',
  TWO_FA_DISABLED: '2FA_DISABLED',
  SESSION_REMOVED: 'SESSION_REMOVED',
  LOGOUT_ALL: 'LOGOUT_ALL',
} as const;

export const SECURITY_ACTIVITY_LABELS: Record<SecurityActivityType, string> = {
  NEW_LOGIN: 'New login',
  PASSWORD_CHANGED: 'Password reset requested',
  '2FA_ENABLED': 'Two-factor authentication enabled',
  '2FA_DISABLED': 'Two-factor authentication disabled',
  SESSION_REMOVED: 'Session removed',
  LOGOUT_ALL: 'Signed out of all devices',
};
