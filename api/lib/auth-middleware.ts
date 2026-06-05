import type { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { getPrisma } from './prisma';

export type AuthedRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
    role?: { name: string } | null;
  };
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
    const payload = jwt.verify(token, jwtSecret()) as { sub: string };
    const user = await getPrisma().user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.is_banned || user.is_deleted) {
      res.status(403).json({ success: false, message: 'User is banned or deleted' });
      return false;
    }

    req.user = user;
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
