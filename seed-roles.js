const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rolesToCreate = [
    { name: 'SUPER_ADMIN', description: 'Full system access, manage admins, system configuration, all data visibility.' },
    { name: 'ADMIN', description: 'Full access to platform administration, user management, and campaign moderation.' },
    { name: 'MODERATOR', description: 'Review flagged campaigns, user reports, and dispute resolutions.' },
    { name: 'FINANCE', description: 'Manage transactions, payouts, financial reporting, and escrow status.' },
    { name: 'SUPPORT', description: 'View-only access to resolve user tickets, view campaign history.' },
    { name: 'BRAND', description: 'Brand role for corporate and company clients to manage campaigns.' },
    { name: 'CREATOR', description: 'Influencer/Creator role to showcase profile and participate in campaigns.' }
  ];

  console.log('Starting to seed roles...');

  for (const roleData of rolesToCreate) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: { name: roleData.name, description: roleData.description }
    });
    console.log(`Upserted role: ${role.name}`);
  }

  console.log('Roles seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
