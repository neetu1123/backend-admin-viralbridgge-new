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

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractBearer(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret()) as { sub: string };
    const user = await getPrisma().user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.is_banned || user.is_deleted) {
      return res.status(403).json({ success: false, message: 'User is banned or deleted' });
    }

    const roleName = user.role?.name || '';
    if (!['SUPER_ADMIN', 'ADMIN'].includes(roleName)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
