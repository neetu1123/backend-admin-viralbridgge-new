import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getPrisma } from './lib/prisma';

export async function handleAuthRegister(body: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}) {
  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const password = body?.password;

  if (!name || !email || !password) {
    return {
      status: 400 as const,
      body: { success: false, message: 'Name, email, and password are required' },
    };
  }

  const existingUser = await getPrisma().user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      status: 400 as const,
      body: { success: false, message: 'User with this email already exists' },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const roleName = String(body.role || 'CREATOR').toUpperCase();
  const role = await getPrisma().role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName, description: `${roleName} role` },
  });

  const user = await getPrisma().user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role_id: role.id,
      wallets: { create: {} },
    },
    include: { role: true },
  });

  if (roleName === 'BRAND') {
    await getPrisma().brandProfile.create({
      data: { user_id: user.id, company_name: name },
    });
  }

  if (roleName === 'CREATOR') {
    await getPrisma().creatorProfile.create({
      data: { user_id: user.id, full_name: name, languages: [] },
    });
  }

  const jti = randomUUID();
  const secret = process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026';
  const access_token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role?.name || roleName, jti },
    secret,
    { expiresIn: '7d' },
  );

  return {
    status: 201 as const,
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
