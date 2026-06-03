const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com';
  const password = 'Admin@123';
  const name = 'Super Admin';

  const hashedPassword = await bcrypt.hash(password, 10);

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrator' }
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role_id: adminRole.id,
      name: name
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role_id: adminRole.id,
      is_verified: true,
      status: 'ACTIVE'
    }
  });

  console.log(`Successfully created/updated admin user: ${user.email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
