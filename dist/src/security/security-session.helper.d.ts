export type SessionMeta = {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
};
export declare function parseUserAgent(userAgent?: string): {
    deviceName: string;
    browser: string;
};
export declare function extractClientIp(headers: Record<string, string | string[] | undefined>): string;
