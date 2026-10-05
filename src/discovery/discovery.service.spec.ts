import { JwtService } from '@nestjs/jwt';
import { DiscoveryService } from './discovery.service';

function brandRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'brand-1',
    user_id: 'user-1',
    slug: 'e-gym',
    company_name: 'E-Gym',
    description: 'Family gym',
    short_description: 'Gym in Malad',
    category: 'Gyms',
    industry: 'Fitness',
    services: ['Personal Training'],
    phone: '9999999999',
    contact_email: 'private@example.com',
    whatsapp: '9999999999',
    address: 'Secret lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Malad West',
    location: 'Mumbai',
    website: 'egym.in',
    is_phone_public: false,
    is_email_public: false,
    is_whatsapp_public: false,
    is_address_public: false,
    discovery_status: 'ACTIVE',
    featured: true,
    rating: 4.5,
    review_count: 12,
    gallery: [],
    social_links: { instagram: 'https://instagram.com/egym' },
    created_at: new Date('2026-01-01'),
    user: {
      id: 'user-1',
      name: 'Brand Owner',
      avatar: null,
      status: 'ACTIVE',
      is_deleted: false,
      is_banned: false,
      is_verified: true,
    },
    campaigns: [],
    _count: { campaigns: 3 },
    ...overrides,
  };
}

describe('DiscoveryService', () => {
  const prisma: any = {
    discoveryCategory: {
      count: jest.fn().mockResolvedValue(1),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    brandProfile: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creatorProfile: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    discoveryEvent: { create: jest.fn().mockResolvedValue({}), count: jest.fn(), groupBy: jest.fn() },
    discoveryEnquiry: { count: jest.fn().mockResolvedValue(0), create: jest.fn() },
    user: { update: jest.fn() },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
    notification: { create: jest.fn() },
  };
  const notifications = { create: jest.fn().mockResolvedValue({}) };
  const jwt = { verifyAsync: jest.fn() };
  let service: DiscoveryService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.discoveryCategory.count.mockResolvedValue(1);
    prisma.discoveryCategory.findFirst.mockResolvedValue(null);
    prisma.creatorProfile.findMany.mockResolvedValue([]);
    prisma.creatorProfile.findFirst.mockResolvedValue(null);
    prisma.discoveryEvent.create.mockResolvedValue({});
    prisma.discoveryEnquiry.count.mockResolvedValue(0);
    service = new DiscoveryService(prisma, notifications as never, jwt as unknown as JwtService);
  });

  it('does not return private contact fields on public profiles', async () => {
    prisma.brandProfile.findFirst.mockResolvedValue(brandRow());
    const profile = await service.getBySlug('e-gym');
    expect(profile.contact.phone).toBeNull();
    expect(profile.contact.email).toBeNull();
    expect(profile.contact.whatsapp).toBeNull();
    expect(profile.contact.address).toBeNull();
    expect(profile.contact.website).toBe('https://egym.in');
  });

  it('returns public contact fields only when flags are true', async () => {
    prisma.brandProfile.findFirst.mockResolvedValue(
      brandRow({ is_phone_public: true, is_email_public: true, is_address_public: true }),
    );
    const profile = await service.getBySlug('e-gym');
    expect(profile.contact.phone).toBe('9999999999');
    expect(profile.contact.email).toBe('private@example.com');
    expect(profile.contact.address).toBe('Secret lane');
  });

  it('hides hidden listings from public search', async () => {
    prisma.brandProfile.findMany.mockResolvedValue([]);
    await service.search({ q: 'gym', city: 'Mumbai', page: 1, limit: 20 });
    expect(prisma.brandProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ discovery_status: 'ACTIVE' }),
      }),
    );
  });

  it('paginates ranked brand and creator results', async () => {
    prisma.brandProfile.findMany.mockResolvedValue([
      brandRow({ id: 'b1', company_name: 'Alpha Gym', featured: false, rating: 3 }),
      brandRow({ id: 'b2', company_name: 'Beta Gym', featured: true, rating: 5 }),
    ]);
    const result = await service.search({ q: 'gym', page: 1, limit: 1 });
    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('ignores honeypot enquiries', async () => {
    const result = await service.createEnquiry('e-gym', {
      name: 'Bot',
      email: 'bot@example.com',
      message: 'hi',
      website_url: 'https://spam.test',
    });
    expect(result).toEqual({ success: true });
    expect(prisma.discoveryEnquiry.create).not.toHaveBeenCalled();
  });
});
