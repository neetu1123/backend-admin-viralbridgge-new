"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECURITY_ACTIVITY_LABELS = exports.SECURITY_AUDIT_ACTIONS = exports.SECURITY_ACTIVITY_TYPES = void 0;
exports.SECURITY_ACTIVITY_TYPES = [
    'NEW_LOGIN',
    'PASSWORD_CHANGED',
    '2FA_ENABLED',
    '2FA_DISABLED',
    'SESSION_REMOVED',
    'LOGOUT_ALL',
    'ACCOUNT_DEACTIVATED',
];
exports.SECURITY_AUDIT_ACTIONS = {
    PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    TWO_FA_ENABLED: '2FA_ENABLED',
    TWO_FA_DISABLED: '2FA_DISABLED',
    SESSION_REMOVED: 'SESSION_REMOVED',
    LOGOUT_ALL: 'LOGOUT_ALL',
};
exports.SECURITY_ACTIVITY_LABELS = {
    NEW_LOGIN: 'New login',
    PASSWORD_CHANGED: 'Password changed',
    '2FA_ENABLED': 'Two-factor authentication enabled',
    '2FA_DISABLED': 'Two-factor authentication disabled',
    SESSION_REMOVED: 'Session removed',
    LOGOUT_ALL: 'Signed out of all devices',
    ACCOUNT_DEACTIVATED: 'Account deactivated',
};
//# sourceMappingURL=security.constants.js.map