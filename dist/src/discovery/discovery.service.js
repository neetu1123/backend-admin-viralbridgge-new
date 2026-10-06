"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const discovery_constants_1 = require("./discovery.constants");
let DiscoveryService = class DiscoveryService {
    prisma;
    notifications;
    jwt;
    constructor(prisma, notifications, jwt) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.jwt = jwt;
    }
    async ensureCategories() {
        const count = await this.prisma.discoveryCategory.count();
        if (count > 0)
            return;
        await this.prisma.discoveryCategory.createMany({
            data: discovery_constants_1.DEFAULT_DISCOVERY_CATEGORIES.map((row) => ({
                name: row.name,
                slug: row.slug,
                icon: row.icon,
                type: row.type,
                sort_order: row.sort_order,
                status: 'ACTIVE',
            })),
            skipDuplicates: true,
        });
    }
    async getCategories(type) {
        await this.ensureCategories();
        const where = { status: 'ACTIVE' };
        if (type && type !== 'all') {
            const normalized = type.toUpperCase() === 'BRAND' ? 'BUSINESS' : type.toUpperCase();
            where.OR = [{ type: 'BOTH' }, { type: normalized }];
        }
        return this.prisma.discoveryCategory.findMany({
            where,
            orderBy: { sort_order: 'asc' },
        });
    }
    async getLocations() {
        const [brandCities, creatorCities] = await Promise.all([
            this.prisma.brandProfile.findMany({
                where: { OR: [{ city: { not: null } }, { location: { not: null } }] },
                select: { city: true, state: true, location: true, area: true },
                take: 400,
            }),
            this.prisma.creatorProfile.findMany({
                where: { OR: [{ city: { not: null } }, { locality: { not: null } }] },
                select: { city: true, state: true, locality: true, area: true },
                take: 400,
            }),
        ]);
        const map = new Map();
        for (const city of discovery_constants_1.DISCOVERY_CITIES) {
            map.set(city.name.toLowerCase(), { name: city.name, state: city.state, slug: city.slug, areas: [] });
        }
        const ingest = (name, state, area) => {
            const cityName = (name || '').trim();
            if (!cityName)
                return;
            const key = cityName.toLowerCase();
            const existing = map.get(key) ?? {
                name: cityName,
                state: state || '',
                slug: (0, discovery_constants_1.slugify)(cityName),
                areas: [],
            };
            if (state && !existing.state)
                existing.state = state;
            if (area && !existing.areas.includes(area))
                existing.areas.push(area);
            map.set(key, existing);
        };
        for (const row of brandCities)
            ingest(row.city || this.cityFromLocation(row.location), row.state, row.area);
        for (const row of creatorCities)
            ingest(row.city || row.locality, row.state, row.area);
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }
    async search(query, options) {
        const page = query.page ?? 1;
        const limit = Math.min(100, query.limit ?? 20);
        const parsed = (0, discovery_constants_1.parseLocationFromQuery)(query.q || query.search || '');
        const keyword = parsed.keyword;
        const city = query.city || parsed.city;
        const area = query.area || parsed.area;
        const category = await this.resolveCategoryTerm(query.category);
        const type = (query.type || 'all').toLowerCase();
        const verifiedOnly = query.verified === 'true' || query.verified === '1';
        const minRating = query.rating ?? 0;
        const status = (query.status || 'active').toLowerCase();
        const includeHidden = Boolean(options?.includeHidden);
        const activeOnly = !includeHidden && status !== 'all';
        const includeBusiness = type === 'all' || type === 'business' || type === 'brand';
        const includeCreator = type === 'all' || type === 'creator';
        const [brands, creators] = await Promise.all([
            includeBusiness
                ? this.findBrands({ keyword, city, area, category, verifiedOnly, minRating, activeOnly, includeHidden })
                : Promise.resolve([]),
            includeCreator
                ? this.findCreators({ keyword, city, area, category, verifiedOnly, minRating, activeOnly, includeHidden })
                : Promise.resolve([]),
        ]);
        const ranked = [...brands, ...creators]
            .map((item) => ({ ...item, score: this.score(item, { keyword, city, category }) }))
            .sort((a, b) => {
            switch (query.sort) {
                case 'rating':
                    return b.rating - a.rating;
                case 'popular':
                case 'most_popular':
                    return (b.popularity ?? 0) - (a.popularity ?? 0);
                case 'newest':
                case 'recently_added':
                    return +new Date(b.createdAt) - +new Date(a.createdAt);
                case 'name':
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                default:
                    return b.score - a.score;
            }
        });
        const total = ranked.length;
        const data = ranked.slice((page - 1) * limit, page * limit).map(({ score: _score, popularity: _pop, ...rest }) => rest);
        void this.trackEvent({
            event_type: 'search',
            query: keyword || undefined,
            city,
            category,
        }).catch(() => undefined);
        return { data, pagination: (0, pagination_query_dto_1.paginationMeta)(page, limit, total), meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async getBySlug(slug) {
        const normalized = decodeURIComponent(slug).trim().toLowerCase();
        if (!normalized)
            throw new common_1.NotFoundException('Profile not found');
        const [brand, creator] = await Promise.all([
            this.prisma.brandProfile.findFirst({
                where: {
                    OR: [{ slug: normalized }, { company_name: { equals: this.unslug(normalized), mode: 'insensitive' } }],
                    user: { status: 'ACTIVE', is_deleted: false, is_banned: false },
                },
                include: { user: true, campaigns: { where: { status: { in: ['ACTIVE', 'APPROVED'] } }, take: 6 } },
            }),
            this.prisma.creatorProfile.findFirst({
                where: {
                    OR: [
                        { slug: normalized },
                        { full_name: { equals: this.unslug(normalized), mode: 'insensitive' } },
                        { user: { name: { equals: this.unslug(normalized), mode: 'insensitive' } } },
                    ],
                    user: { status: 'ACTIVE', is_deleted: false, is_banned: false },
                },
                include: { user: true },
            }),
        ]);
        const brandMatch = brand && (brand.slug === normalized || (0, discovery_constants_1.slugify)(brand.company_name) === normalized);
        const creatorMatch = creator && (creator.slug === normalized || (0, discovery_constants_1.slugify)(creator.full_name || creator.user.name) === normalized);
        if (brandMatch && (!creatorMatch || (brand.featured && !creator.featured))) {
            if (brand.discovery_status && brand.discovery_status !== 'ACTIVE')
                throw new common_1.NotFoundException('Profile not found');
            void this.trackEvent({ event_type: 'profile_view', listing_type: 'BUSINESS', listing_id: brand.id }).catch(() => undefined);
            return this.formatBrandDetail(brand);
        }
        if (creatorMatch) {
            if (creator.discovery_status && creator.discovery_status !== 'ACTIVE')
                throw new common_1.NotFoundException('Profile not found');
            void this.trackEvent({ event_type: 'profile_view', listing_type: 'CREATOR', listing_id: creator.id }).catch(() => undefined);
            return this.formatCreatorDetail(creator);
        }
        if (brand && (!brand.discovery_status || brand.discovery_status === 'ACTIVE')) {
            void this.trackEvent({ event_type: 'profile_view', listing_type: 'BUSINESS', listing_id: brand.id }).catch(() => undefined);
            return this.formatBrandDetail(brand);
        }
        throw new common_1.NotFoundException('Profile not found');
    }
    async createEnquiry(slugOrId, dto, authHeader, ip) {
        if (dto.website_url?.trim()) {
            return { success: true };
        }
        if (!dto.name?.trim() || !dto.email?.trim() || !dto.message?.trim()) {
            throw new common_1.BadRequestException('Name, email and message are required');
        }
        const since = new Date(Date.now() - 60 * 60 * 1000);
        const recent = await this.prisma.discoveryEnquiry.count({
            where: {
                created_at: { gte: since },
                OR: [{ email: dto.email.trim().toLowerCase() }, ...(ip ? [{ message: { contains: ip } }] : [])],
            },
        });
        if (recent >= 5) {
            throw new common_1.BadRequestException('Too many enquiries. Please try again later.');
        }
        const profile = await this.resolveListing(slugOrId);
        const senderUserId = await this.optionalUserId(authHeader);
        const enquiry = await this.prisma.discoveryEnquiry.create({
            data: {
                listing_type: profile.type,
                brand_id: profile.type === 'BUSINESS' ? profile.id : null,
                creator_id: profile.type === 'CREATOR' ? profile.id : null,
                sender_user_id: senderUserId,
                name: dto.name.trim(),
                email: dto.email.trim().toLowerCase(),
                phone: dto.phone?.trim() || null,
                message: dto.message.trim(),
            },
        });
        await this.notifications
            .create({
            userId: profile.userId,
            title: 'New discovery enquiry',
            message: `${dto.name.trim()} sent an enquiry from ViralBridge Discover.`,
            type: 'SYSTEM',
            entityType: 'DISCOVERY_ENQUIRY',
            entityId: enquiry.id,
            metadata: { listingType: profile.type, listingId: profile.id },
        })
            .catch(() => undefined);
        void this.trackEvent({
            event_type: 'enquiry_sent',
            listing_type: profile.type,
            listing_id: profile.id,
        }).catch(() => undefined);
        return { success: true, id: enquiry.id };
    }
    async trackEvent(dto) {
        await this.prisma.discoveryEvent.create({
            data: {
                event_type: dto.event_type,
                listing_type: dto.listing_type,
                listing_id: dto.listing_id,
                category: dto.category,
                city: dto.city,
                query: dto.query?.slice(0, 200),
            },
        });
        return { success: true };
    }
    async adminList(query) {
        return this.search(query, { includeHidden: true });
    }
    async adminUpdate(id, type, body, adminId) {
        const listingType = type.toUpperCase() === 'CREATOR' ? 'CREATOR' : 'BUSINESS';
        if (listingType === 'BUSINESS') {
            const brand = await this.prisma.brandProfile.findUnique({ where: { id }, include: { user: true } });
            if (!brand)
                throw new common_1.NotFoundException('Business not found');
            await this.prisma.brandProfile.update({
                where: { id },
                data: {
                    featured: body.featured ?? brand.featured,
                    discovery_status: body.discovery_status ?? brand.discovery_status,
                    is_phone_public: body.is_phone_public ?? brand.is_phone_public,
                    is_email_public: body.is_email_public ?? brand.is_email_public,
                    is_whatsapp_public: body.is_whatsapp_public ?? brand.is_whatsapp_public,
                    is_address_public: body.is_address_public ?? brand.is_address_public,
                },
            });
            if (typeof body.verified === 'boolean') {
                await this.prisma.user.update({ where: { id: brand.user_id }, data: { is_verified: body.verified } });
            }
        }
        else {
            const creator = await this.prisma.creatorProfile.findUnique({ where: { id }, include: { user: true } });
            if (!creator)
                throw new common_1.NotFoundException('Creator not found');
            await this.prisma.creatorProfile.update({
                where: { id },
                data: {
                    featured: body.featured ?? creator.featured,
                    discovery_status: body.discovery_status ?? creator.discovery_status,
                    is_phone_public: body.is_phone_public ?? creator.is_phone_public,
                    is_email_public: body.is_email_public ?? creator.is_email_public,
                    is_whatsapp_public: body.is_whatsapp_public ?? creator.is_whatsapp_public,
                },
            });
            if (typeof body.verified === 'boolean') {
                await this.prisma.user.update({ where: { id: creator.user_id }, data: { is_verified: body.verified } });
            }
        }
        await this.prisma.auditLog.create({
            data: {
                admin_id: adminId,
                action: 'UPDATE_DISCOVERY_LISTING',
                entity: listingType,
                entity_id: id,
                metadata: body,
            },
        }).catch(() => undefined);
        return { success: true };
    }
    async adminAnalytics() {
        const [searches, views, contacts, enquiries, topCities, topCategories] = await Promise.all([
            this.prisma.discoveryEvent.count({ where: { event_type: 'search' } }),
            this.prisma.discoveryEvent.count({ where: { event_type: 'profile_view' } }),
            this.prisma.discoveryEvent.count({ where: { event_type: { in: ['contact_click', 'whatsapp_click', 'website_click'] } } }),
            this.prisma.discoveryEnquiry.count(),
            this.prisma.discoveryEvent.groupBy({
                by: ['city'],
                where: { city: { not: null } },
                _count: { _all: true },
                orderBy: { _count: { city: 'desc' } },
                take: 10,
            }).catch(() => []),
            this.prisma.discoveryEvent.groupBy({
                by: ['category'],
                where: { category: { not: null } },
                _count: { _all: true },
                orderBy: { _count: { category: 'desc' } },
                take: 10,
            }).catch(() => []),
        ]);
        return { searches, views, contacts, enquiries, topCities, topCategories };
    }
    async findBrands(params) {
        const where = {
            user: { status: 'ACTIVE', is_deleted: false, is_banned: false },
        };
        if (!params.includeHidden) {
            where.discovery_status = params.activeOnly ? 'ACTIVE' : { notIn: ['HIDDEN', 'SUSPENDED'] };
        }
        if (params.verifiedOnly)
            where.user = { ...where.user, is_verified: true };
        if (params.minRating > 0)
            where.rating = { gte: params.minRating };
        if (params.city) {
            where.AND = [
                ...(where.AND ?? []),
                {
                    OR: [
                        { city: { contains: params.city, mode: 'insensitive' } },
                        { location: { contains: params.city, mode: 'insensitive' } },
                        { address: { contains: params.city, mode: 'insensitive' } },
                    ],
                },
            ];
        }
        if (params.area) {
            where.AND = [
                ...(where.AND ?? []),
                { OR: [{ area: { contains: params.area, mode: 'insensitive' } }, { address: { contains: params.area, mode: 'insensitive' } }] },
            ];
        }
        if (params.category) {
            where.AND = [
                ...(where.AND ?? []),
                {
                    OR: [
                        { category: { contains: params.category, mode: 'insensitive' } },
                        { industry: { contains: params.category, mode: 'insensitive' } },
                        { services: { has: params.category } },
                    ],
                },
            ];
        }
        if (params.keyword) {
            where.AND = [
                ...(where.AND ?? []),
                {
                    OR: [
                        { company_name: { contains: params.keyword, mode: 'insensitive' } },
                        { description: { contains: params.keyword, mode: 'insensitive' } },
                        { short_description: { contains: params.keyword, mode: 'insensitive' } },
                        { industry: { contains: params.keyword, mode: 'insensitive' } },
                        { category: { contains: params.keyword, mode: 'insensitive' } },
                        { services: { hasSome: [params.keyword] } },
                    ],
                },
            ];
        }
        const rows = await this.prisma.brandProfile.findMany({
            where,
            include: { user: true, _count: { select: { campaigns: true } } },
            take: 80,
        });
        return rows.map((row) => this.formatBrandCard(row));
    }
    async findCreators(params) {
        const where = {
            user: { status: 'ACTIVE', is_deleted: false, is_banned: false },
        };
        if (!params.includeHidden) {
            where.discovery_status = params.activeOnly ? 'ACTIVE' : { notIn: ['HIDDEN', 'SUSPENDED'] };
        }
        if (params.verifiedOnly)
            where.user = { ...where.user, is_verified: true };
        if (params.minRating > 0)
            where.rating = { gte: params.minRating };
        if (params.city) {
            where.AND = [
                ...(where.AND ?? []),
                {
                    OR: [
                        { city: { contains: params.city, mode: 'insensitive' } },
                        { locality: { contains: params.city, mode: 'insensitive' } },
                    ],
                },
            ];
        }
        if (params.area) {
            where.AND = [...(where.AND ?? []), { area: { contains: params.area, mode: 'insensitive' } }];
        }
        if (params.category) {
            where.AND = [
                ...(where.AND ?? []),
                {
                    OR: [
                        { category: { contains: params.category, mode: 'insensitive' } },
                        { niche: { contains: params.category, mode: 'insensitive' } },
                    ],
                },
            ];
        }
        if (params.keyword) {
            where.AND = [
                ...(where.AND ?? []),
                {
                    OR: [
                        { full_name: { contains: params.keyword, mode: 'insensitive' } },
                        { bio: { contains: params.keyword, mode: 'insensitive' } },
                        { niche: { contains: params.keyword, mode: 'insensitive' } },
                        { category: { contains: params.keyword, mode: 'insensitive' } },
                        { user: { name: { contains: params.keyword, mode: 'insensitive' } } },
                    ],
                },
            ];
        }
        const rows = await this.prisma.creatorProfile.findMany({
            where,
            include: { user: true },
            take: 80,
        });
        return rows.map((row) => this.formatCreatorCard(row));
    }
    score(item, ctx) {
        let score = 0;
        const name = item.name.toLowerCase();
        const keyword = (ctx.keyword || '').toLowerCase();
        if (keyword && name === keyword)
            score += 100;
        else if (keyword && name.startsWith(keyword))
            score += 80;
        else if (keyword && name.includes(keyword))
            score += 50;
        if (ctx.category && item.category.toLowerCase().includes(ctx.category.toLowerCase()))
            score += 40;
        if (ctx.city && item.city.toLowerCase().includes(ctx.city.toLowerCase()))
            score += 25;
        if (item.services?.some((s) => keyword && s.toLowerCase().includes(keyword)))
            score += 30;
        if (item.verified)
            score += 15;
        if (item.featured)
            score += 20;
        score += item.rating * 2;
        return score;
    }
    formatBrandCard(row) {
        const name = row.company_name;
        const slug = row.slug || (0, discovery_constants_1.slugify)(name);
        const category = row.category || row.industry || 'Services';
        const city = row.city || this.cityFromLocation(row.location) || '';
        return {
            id: row.id,
            type: 'BUSINESS',
            name,
            slug,
            logo: row.logo || row.user?.avatar || '',
            coverImage: row.cover_image || '',
            shortDescription: row.short_description || row.description || '',
            category,
            subcategory: row.subcategory || '',
            city,
            state: row.state || '',
            area: row.area || '',
            locationLabel: [row.area, city].filter(Boolean).join(', '),
            verified: Boolean(row.user?.is_verified),
            featured: Boolean(row.featured),
            rating: Number(row.rating) || 0,
            reviewCount: row.review_count || 0,
            services: row.services ?? [],
            tags: (row.services ?? []).slice(0, 3),
            discoveryStatus: row.discovery_status || 'ACTIVE',
            createdAt: row.created_at,
            popularity: row._count?.campaigns ?? 0,
        };
    }
    formatCreatorCard(row) {
        const name = row.full_name || row.user?.name || 'Creator';
        const slug = row.slug || (0, discovery_constants_1.slugify)(name);
        const category = row.category || row.niche || 'Lifestyle';
        const city = row.city || row.locality || '';
        const social = row.social_links ?? {};
        return {
            id: row.id,
            type: 'CREATOR',
            name,
            slug,
            logo: row.photo || row.user?.avatar || '',
            coverImage: row.cover_image || '',
            shortDescription: row.bio || '',
            category,
            subcategory: row.subcategory || '',
            city,
            state: row.state || '',
            area: row.area || '',
            locationLabel: [row.area, city].filter(Boolean).join(', '),
            verified: Boolean(row.user?.is_verified),
            featured: Boolean(row.featured),
            rating: Number(row.rating) || 0,
            reviewCount: row.review_count || 0,
            services: [],
            tags: [social.instagram && 'Instagram', social.youtube && 'YouTube', social.tiktok && 'TikTok'].filter(Boolean).slice(0, 3),
            discoveryStatus: row.discovery_status || 'ACTIVE',
            createdAt: row.created_at,
            popularity: row.followers ?? 0,
        };
    }
    formatBrandDetail(row) {
        const card = this.formatBrandCard(row);
        return {
            ...card,
            description: row.description || row.short_description || '',
            website: this.safeWebsite(row.website),
            contact: {
                phone: row.is_phone_public ? row.phone || null : null,
                email: row.is_email_public ? row.contact_email || null : null,
                whatsapp: row.is_whatsapp_public ? row.whatsapp || row.phone || null : null,
                website: this.safeWebsite(row.website),
                address: row.is_address_public ? row.address || null : null,
            },
            gallery: row.gallery ?? [],
            services: row.services ?? [],
            businessHours: row.business_hours ?? null,
            establishedYear: row.established_year ?? null,
            socialLinks: this.publicSocial(row.social_links),
            campaigns: (row.campaigns ?? []).map((c) => ({ id: c.id, title: c.title, status: c.status })),
        };
    }
    formatCreatorDetail(row) {
        const card = this.formatCreatorCard(row);
        const social = this.publicSocial(row.social_links);
        return {
            ...card,
            description: row.bio || '',
            languages: row.languages ?? [],
            followers: row.followers ?? 0,
            engagement: row.engagement_rate ?? 0,
            portfolio: row.portfolio || '',
            gallery: row.gallery ?? [],
            socialLinks: social,
            contact: {
                phone: row.is_phone_public ? row.phone || null : null,
                email: row.is_email_public ? row.contact_email || null : null,
                whatsapp: row.is_whatsapp_public ? row.whatsapp || row.phone || null : null,
                website: null,
                address: null,
            },
        };
    }
    publicSocial(value) {
        const links = value ?? {};
        const out = {};
        for (const [key, raw] of Object.entries(links)) {
            if (typeof raw === 'string' && raw.trim() && !/^javascript:/i.test(raw))
                out[key] = raw.trim();
        }
        return out;
    }
    safeWebsite(value) {
        const raw = (value || '').trim();
        if (!raw || /^javascript:/i.test(raw))
            return '';
        if (/^https?:\/\//i.test(raw))
            return raw;
        if (/^[\w.-]+\.[a-z]{2,}/i.test(raw))
            return `https://${raw}`;
        return '';
    }
    async resolveCategoryTerm(value) {
        if (!value)
            return undefined;
        await this.ensureCategories();
        const row = await this.prisma.discoveryCategory.findFirst({
            where: {
                OR: [{ slug: value }, { name: { equals: value, mode: 'insensitive' } }],
            },
        });
        return row?.name ?? value;
    }
    cityFromLocation(location) {
        if (!location)
            return '';
        const part = location.split(',')[0]?.trim() ?? '';
        return part;
    }
    unslug(slug) {
        return slug.replace(/-/g, ' ');
    }
    async resolveListing(slugOrId) {
        const brand = await this.prisma.brandProfile.findFirst({
            where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
            include: { user: true },
        });
        if (brand)
            return { type: 'BUSINESS', id: brand.id, userId: brand.user_id };
        const creator = await this.prisma.creatorProfile.findFirst({
            where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
            include: { user: true },
        });
        if (creator)
            return { type: 'CREATOR', id: creator.id, userId: creator.user_id };
        throw new common_1.NotFoundException('Profile not found');
    }
    async optionalUserId(authHeader) {
        if (!authHeader?.startsWith('Bearer '))
            return undefined;
        const token = authHeader.slice(7);
        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026',
            });
            return payload.sub;
        }
        catch {
            return undefined;
        }
    }
};
exports.DiscoveryService = DiscoveryService;
exports.DiscoveryService = DiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        jwt_1.JwtService])
], DiscoveryService);
//# sourceMappingURL=discovery.service.js.map