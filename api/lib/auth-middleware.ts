import type { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { isFullAccessUser } from '../../src/auth/feature-access';
import { getPrisma } from './prisma';

export type AuthedRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
    role?: { name: string } | null;
    feature_access?: string | null;
  };
  jwtPayload?: { jti?: string; sub?: string; exp?: number };
};

function extractBearer(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}

function jwtSecret(): string {
  return process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026';
}

async function authenticate(req: AuthedRequest, res: Response): Promise<boolean> {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return false;
  }

  try {
    const payload = jwt.verify(token, jwtSecret()) as { sub: string; jti?: string; exp?: number };
    const user = await getPrisma().user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.is_banned || user.is_deleted) {
      res.status(403).json({ success: false, message: 'User is banned or deleted' });
      return false;
    }

    if (payload.jti) {
      const revoked = await getPrisma().revokedToken.findUnique({ where: { jti: payload.jti } });
      if (revoked) {
        res.status(401).json({ success: false, message: 'Token has been revoked' });
        return false;
      }
    }

    req.user = user;
    req.jwtPayload = payload;
    return true;
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return false;
  }
}

function roleAllowed(roleName: string, allowed: string[]): boolean {
  if (['SUPER_ADMIN', 'ADMIN'].includes(roleName)) return true;
  return allowed.includes(roleName);
}

export function requireRoles(...allowed: string[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!(await authenticate(req, res))) return;
    const roleName = req.user?.role?.name || '';
    if (!roleAllowed(roleName, allowed)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!(await authenticate(req, res))) return;
  return next();
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!(await authenticate(req, res))) return;
  const roleName = req.user?.role?.name || '';
  if (!['SUPER_ADMIN', 'ADMIN'].includes(roleName)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return next();
}

export const requireBrand = requireRoles('BRAND');
export const requireCreator = requireRoles('CREATOR');
export const requireBrandOrCreator = requireRoles('BRAND', 'CREATOR');

const LIMITED_BRAND_PATHS = ['/profile', '/upload-logo', '/settings', '/notifications'];
const LIMITED_CREATOR_PATHS = [
  '/profile',
  '/upload-photo',
  '/upload-media-kit',
  '/settings',
  '/notifications',
];

function pathAllowed(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function requireFullAccess(req: AuthedRequest, res: Response, next: NextFunction) {
  if (isFullAccessUser(req.user)) return next();
  return res.status(403).json({
    success: false,
    message: 'Campaigns, wallet, and discovery tools require a subscription or admin approval.',
  });
}

export function requireFullAccessUnless(allowedPrefixes: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (pathAllowed(req.path, allowedPrefixes) || isFullAccessUser(req.user)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Campaigns, wallet, and discovery tools require a subscription or admin approval.',
    });
  };
}

export const requireBrandFullAccess = requireFullAccessUnless(LIMITED_BRAND_PATHS);
export const requireCreatorFullAccess = requireFullAccessUnless(LIMITED_CREATOR_PATHS);
