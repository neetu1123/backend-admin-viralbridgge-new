import * as jwt from 'jsonwebtoken';
import { getPrisma } from './lib/prisma';

function extractBearerToken(authHeader: string | string[] | undefined): string | null {
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!raw) return null;
  const [type, token] = raw.split(' ');
  return type === 'Bearer' && token ? token : null;
}

function mapUser(user: {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: { name: string } | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    role: user.role?.name ?? undefined,
  };
}

export async function handleAuthMe(headers: Record<string, string | string[] | undefined>) {
  const token = extractBearerToken(headers.authorization);
  if (!token) {
    return { status: 401 as const, body: { success: false, message: 'No token provided' } };
  }

  const secret = process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026';

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, secret) as jwt.JwtPayload;
  } catch {
    return { status: 401 as const, body: { success: false, message: 'Invalid or expired token' } };
  }

  if (payload.jti) {
    const revoked = await getPrisma().revokedToken.findUnique({
      where: { jti: String(payload.jti) },
    });
    if (revoked) {
      return { status: 401 as const, body: { success: false, message: 'Token has been revoked' } };
    }
  }

  const userId = payload.sub ? String(payload.sub) : null;
  if (!userId) {
    return { status: 401 as const, body: { success: false, message: 'Invalid token payload' } };
  }

  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    return { status: 401 as const, body: { success: false, message: 'User not found' } };
  }

  if (user.is_banned || user.is_deleted) {
    return { status: 403 as const, body: { success: false, message: 'User is banned or deleted' } };
  }

  return {
    status: 200 as const,
    body: {
      success: true,
      data: mapUser(user),
    },
  };
}
