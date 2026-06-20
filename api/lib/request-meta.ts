import type { Request } from 'express';
import type { AuthedRequest } from './auth-middleware';

export function sessionMetaFromRequest(req: Request | AuthedRequest) {
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : Array.isArray(forwarded) && forwarded[0]
        ? forwarded[0].split(',')[0].trim()
        : typeof req.headers['x-real-ip'] === 'string'
          ? req.headers['x-real-ip']
          : 'Unknown';

  return {
    ipAddress,
    userAgent,
    location: 'Unknown',
  };
}
