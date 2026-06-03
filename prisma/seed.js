const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function upsertRole(name) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name, description: `${name} role` },
  });
}

async function upsertUser({ email, password, name, roleName, profileType }) {
  const role = await upsertRole(roleName);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name, role_id: role.id, is_verified: true, status: 'ACTIVE' },
    create: {
      email,
      password: hashedPassword,
      name,
      role_id: role.id,
      is_verified: true,
      status: 'ACTIVE',
    },
  });

  await prisma.wallet.upsert({
    where: { user_id: user.id },
    update: {},
    create: { user_id: user.id, available_balance: profileType === 'brand' ? 50000 : 2500 },
  });

  if (profileType === 'brand') {
    await prisma.brandProfile.upsert({
      where: { user_id: user.id },
      update: { company_name: name },
      create: { user_id: user.id, company_name: name, industry: 'Marketing', location: 'Global' },
    });
  }

  if (profileType === 'creator') {
    await prisma.creatorProfile.upsert({
      where: { user_id: user.id },
      update: { full_name: name },
      create: {
        user_id: user.id,
        full_name: name,
        niche: 'Beauty & Skincare',
        followers: 45000,
        engagement_rate: 5.2,
        languages: ['English'],
        locality: 'USA',
      },
    });
  }

  return user;
}

async function main() {
  await upsertUser({
    email: 'admin@gmail.com',
    password: 'Admin@123',
    name: 'Super Admin',
    roleName: 'ADMIN',
  });

  await upsertUser({
    email: 'brand@gmail.com',
    password: 'brand@1234',
    name: 'Luminary Brand',
    roleName: 'BRAND',
    profileType: 'brand',
  });

  await upsertUser({
    email: 'creator@gmail.com',
    password: 'creator@1234',
    name: 'Sofia Martinez',
    roleName: 'CREATOR',
    profileType: 'creator',
  });

  console.log('Seed complete: admin@gmail.com, brand@gmail.com, creator@gmail.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
