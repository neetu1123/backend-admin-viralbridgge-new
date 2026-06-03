const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrator' }
  });

  await prisma.user.updateMany({
    where: { email: 'neetuchaurasiya5041@gmail.com' },
    data: { role_id: adminRole.id }
  });

  console.log('Successfully assigned ADMIN role to neetuchaurasiya5041@gmail.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
