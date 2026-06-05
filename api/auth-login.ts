import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

let prisma: PrismaClient | undefined;

function getPrisma(): PrismaClient {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

export async function handleAuthLogin(body: { email?: string; password?: string }) {
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

  const secret = process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026';
  const access_token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role?.name || 'user' },
    secret,
    { expiresIn: '7d' },
  );

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
