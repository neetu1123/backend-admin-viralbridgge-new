const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });
  if (admin) {
    await prisma.auditLog.create({
      data: {
        admin_id: admin.id,
        action: 'SYSTEM_INIT',
        entity: 'System',
        entity_id: 'sys-001',
        metadata: { message: 'Audit log initialized' }
      }
    });
    console.log('Created dummy audit log');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
Email: admin@gmail.com Password: Admin@123

