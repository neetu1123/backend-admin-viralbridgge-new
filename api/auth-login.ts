import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getPrisma } from './lib/prisma';
import { getSecurityService } from './lib/services';

function sessionMetaFromHeaders(headers: Record<string, string | string[] | undefined>) {
  const userAgent = typeof headers['user-agent'] === 'string' ? headers['user-agent'] : undefined;
  const forwarded = headers['x-forwarded-for'];
  const ipAddress =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : Array.isArray(forwarded) && forwarded[0]
        ? forwarded[0].split(',')[0].trim()
        : typeof headers['x-real-ip'] === 'string'
          ? headers['x-real-ip']
          : 'Unknown';
  return { ipAddress, userAgent, location: 'Unknown' };
}

export async function handleAuthLogin(
  body: { email?: string; password?: string },
  headers: Record<string, string | string[] | undefined> = {},
) {
  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return { status: 400 as const, body: { success: false, message: 'Email and password are required' } };
  }

  const user = await getPrisma().user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user?.password) {
    return { status: 401 as const, body: { success: false, message: 'Invalid email or password' } };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { status: 401 as const, body: { success: false, message: 'Invalid email or password' } };
  }

  const jti = randomUUID();
  const secret = process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026';
  const access_token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role?.name || 'user', jti },
    secret,
    { expiresIn: '7d' },
  );

  try {
    await getSecurityService().recordLogin(user.id, jti, sessionMetaFromHeaders(headers));
  } catch (error) {
    console.error('Failed to record login session:', error);
  }

  return {
    status: 200 as const,
    body: {
      success: true,
      data: {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.name,
        },
      },
    },
  };
}
