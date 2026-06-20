export type SessionMeta = {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
};

export function parseUserAgent(userAgent?: string): { deviceName: string; browser: string } {
  const ua = userAgent ?? 'Unknown';
  const lower = ua.toLowerCase();

  let browser = 'Unknown Browser';
  if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('chrome/') && !lower.includes('edg/')) browser = 'Chrome';
  else if (lower.includes('firefox/')) browser = 'Firefox';
  else if (lower.includes('safari/') && !lower.includes('chrome/')) browser = 'Safari';
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera';

  let deviceName = 'Desktop';
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
    deviceName = 'Mobile';
  } else if (lower.includes('ipad') || lower.includes('tablet')) {
    deviceName = 'Tablet';
  }

  return { deviceName, browser };
}

export function extractClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  const realIp = headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp;
  return 'Unknown';
}
