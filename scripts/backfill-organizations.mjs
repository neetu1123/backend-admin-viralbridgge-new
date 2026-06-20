/**
 * Backfill organizations for existing brand/creator profiles.
 * Run: node scripts/backfill-organizations.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillBrandOrganizations() {
  const brands = await prisma.brandProfile.findMany({
    include: { user: true, organization: true },
  });

  let created = 0;
  for (const brand of brands) {
    if (brand.organization) continue;

    const org = await prisma.organization.create({
      data: {
        type: 'BRAND',
        name: brand.company_name,
        owner_user_id: brand.user_id,
        brand_profile_id: brand.id,
      },
    });

    await prisma.organizationMember.create({
      data: {
        organization_id: org.id,
        user_id: brand.user_id,
        role: 'OWNER',
        status: 'ACTIVE',
        last_active_at: new Date(),
      },
    });
    created += 1;
  }
  return created;
}

async function backfillCreatorOrganizations() {
  const creators = await prisma.creatorProfile.findMany({
    include: { user: true, organization: true },
  });

  let created = 0;
  for (const creator of creators) {
    if (creator.organization) continue;

    const org = await prisma.organization.create({
      data: {
        type: 'CREATOR',
        name: creator.full_name ?? creator.user.name,
        owner_user_id: creator.user_id,
        creator_profile_id: creator.id,
      },
    });

    await prisma.organizationMember.create({
      data: {
        organization_id: org.id,
        user_id: creator.user_id,
        role: 'OWNER',
        status: 'ACTIVE',
        last_active_at: new Date(),
      },
    });
    created += 1;
  }
  return created;
}

async function main() {
  const brandCount = await backfillBrandOrganizations();
  const creatorCount = await backfillCreatorOrganizations();
  console.log(`Backfill complete: ${brandCount} brand org(s), ${creatorCount} creator org(s) created.`);
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
