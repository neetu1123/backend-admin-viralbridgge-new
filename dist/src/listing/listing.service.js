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
exports.ListingService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const discovery_service_1 = require("../discovery/discovery.service");
const storage_service_1 = require("../storage/storage.service");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const discovery_constants_1 = require("../discovery/discovery.constants");
const feature_access_1 = require("../auth/feature-access");
const listing_constants_1 = require("./listing.constants");
let ListingService = class ListingService {
    prisma;
    notifications;
    discovery;
    storage;
    jwt;
    constructor(prisma, notifications, discovery, storage, jwt) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.discovery = discovery;
        this.storage = storage;
        this.jwt = jwt;
    }
    async create(userId, dto) {
        const existing = await this.prisma.freeListing.findUnique({ where: { owner_user_id: userId } });
        if (existing)
            return this.formatOwner(existing);
        const type = dto.type === 'CREATOR' ? 'CREATOR' : 'BUSINESS';
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const name = (dto.name || user?.name || (type === 'CREATOR' ? 'Creator listing' : 'Business listing')).slice(0, listing_constants_1.FREE_LISTING_LIMITS.name);
        const slug = await this.uniqueSlug(name);
        const listing = await this.prisma.freeListing.create({
            data: {
                owner_user_id: userId,
                type,
                name,
                slug,
                email: user?.email || null,
            },
        });
        return this.formatOwner(listing);
    }
    async getMine(userId) {
        const [listing, brand, creator, user] = await Promise.all([
            this.prisma.freeListing.findUnique({ where: { owner_user_id: userId } }),
            this.prisma.brandProfile.findUnique({ where: { user_id: userId }, select: { id: true } }),
            this.prisma.creatorProfile.findUnique({ where: { user_id: userId }, select: { id: true } }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { feature_access: true, access_requested_at: true },
            }),
        ]);
        const account = this.accountKind(Boolean(brand), Boolean(creator));
        const featureAccess = (0, feature_access_1.normalizeFeatureAccess)(user?.feature_access);
        const unlocked = featureAccess === feature_access_1.FEATURE_ACCESS_FULL;
        return {
            listing: listing ? this.formatOwner(listing) : null,
            accountType: account,
            featureAccess,
            accessRequestedAt: user?.access_requested_at ?? null,
            permissions: (0, listing_constants_1.listingPermissions)(account, featureAccess),
            hasBrandProfile: Boolean(brand),
            hasCreatorProfile: Boolean(creator),
            upgradeUrl: unlocked
                ? account === 'BRAND'
                    ? '/brand-campaign-management'
                    : account === 'CREATOR'
                        ? '/campaign-discovery'
                        : '/subscription'
                : '/subscription',
        };
    }
    async getSuggestions(userId, query = {}) {
        const listing = await this.prisma.freeListing.findUnique({ where: { owner_user_id: userId } });
        const city = listing?.city?.trim() || '';
        const category = listing?.category?.trim() || '';
        const subcategory = listing?.subcategory?.trim() || '';
        const services = (listing?.services ?? []).filter(Boolean);
        const budgetMin = query.budgetMin != null ? Number(query.budgetMin) : undefined;
        const budgetMax = query.budgetMax != null ? Number(query.budgetMax) : undefined;
        const followerFilter = this.followerFilterForBudget(budgetMin, budgetMax);
        const nearbyWhere = {
            discovery_status: 'ACTIVE',
            user: { is_banned: false, is_deleted: false },
            ...(followerFilter ? { followers: followerFilter } : {}),
        };
        const nearbyCreators = city
            ? await this.prisma.creatorProfile.findMany({
                where: { ...nearbyWhere, city: { equals: city, mode: 'insensitive' } },
                take: 8,
                orderBy: [{ featured: 'desc' }, { followers: 'desc' }],
                select: {
                    id: true,
                    full_name: true,
                    slug: true,
                    photo: true,
                    niche: true,
                    category: true,
                    city: true,
                    followers: true,
                    rating: true,
                },
            })
            : [];
        const nearby = nearbyCreators.length > 0
            ? nearbyCreators
            : await this.prisma.creatorProfile.findMany({
                where: nearbyWhere,
                take: 8,
                orderBy: [{ featured: 'desc' }, { followers: 'desc' }],
                select: {
                    id: true,
                    full_name: true,
                    slug: true,
                    photo: true,
                    niche: true,
                    category: true,
                    city: true,
                    followers: true,
                    rating: true,
                },
            });
        const relatedOr = [];
        if (category)
            relatedOr.push({ category: { equals: category, mode: 'insensitive' } });
        if (subcategory)
            relatedOr.push({ subcategory: { equals: subcategory, mode: 'insensitive' } });
        if (services.length)
            relatedOr.push({ services: { hasSome: services } });
        const relatedListings = await this.prisma.freeListing.findMany({
            where: {
                status: 'PUBLISHED',
                is_visible: true,
                owner_user_id: { not: userId },
                ...(relatedOr.length ? { OR: relatedOr } : city ? { city: { equals: city, mode: 'insensitive' } } : {}),
            },
            take: 8,
            orderBy: [{ is_featured: 'desc' }, { profile_views: 'desc' }],
        });
        const relatedProducts = Array.from(new Set([
            ...services,
            subcategory,
            category,
            ...relatedListings.flatMap((row) => row.services ?? []),
        ]))
            .filter(Boolean)
            .slice(0, 10);
        return {
            listingReady: Boolean(listing?.city || listing?.category || services.length),
            city: city || null,
            category: category || null,
            budget: {
                min: budgetMin ?? null,
                max: budgetMax ?? null,
                bands: [
                    { label: 'Under ₹5,000', min: 0, max: 5000 },
                    { label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
                    { label: '₹15,000 – ₹50,000', min: 15000, max: 50000 },
                    { label: '₹50,000+', min: 50000, max: null },
                ],
            },
            nearbyCreators: nearby.map((row) => ({
                id: row.id,
                name: row.full_name || 'Creator',
                slug: row.slug,
                photo: row.photo,
                niche: row.niche || row.category,
                city: row.city,
                followers: row.followers,
                rating: row.rating,
                publicPath: row.slug ? `/discover/creator/${row.slug}` : `/business/creator/${row.id}`,
                estimatedBudget: this.estimatedBudgetLabel(row.followers),
            })),
            relatedProducts,
            relatedListings: relatedListings.map((row) => this.formatPublicCard(row)),
        };
    }
    async requestFullAccess(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if ((0, feature_access_1.normalizeFeatureAccess)(user.feature_access) === feature_access_1.FEATURE_ACCESS_FULL) {
            return { status: 'FULL', requestedAt: user.access_requested_at };
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { access_requested_at: new Date() },
        });
        await this.notifications.notifyAdmins({
            type: 'FEATURE_ACCESS_REQUEST',
            title: 'Full access requested',
            message: `${user.name} (${user.email}) asked to unlock campaigns and premium tools.`,
            entityType: 'User',
            entityId: userId,
            metadata: { role: user.role?.name, requestedAt: updated.access_requested_at },
        });
        return { status: 'PENDING', requestedAt: updated.access_requested_at };
    }
    async update(userId, id, dto) {
        const listing = await this.requireOwner(userId, id);
        if (listing.status === 'SUSPENDED') {
            throw new common_1.ForbiddenException('This listing is suspended and cannot be edited.');
        }
        const data = {};
        if (dto.name != null)
            data.name = dto.name.trim().slice(0, listing_constants_1.FREE_LISTING_LIMITS.name);
        if (dto.short_description != null) {
            data.short_description = dto.short_description.trim().slice(0, listing_constants_1.FREE_LISTING_LIMITS.shortDescription);
        }
        if (dto.description != null)
            data.description = dto.description.trim().slice(0, listing_constants_1.FREE_LISTING_LIMITS.description);
        if (dto.category != null)
            data.category = dto.category.trim() || null;
        if (dto.subcategory != null)
            data.subcategory = dto.subcategory.trim() || null;
        if (dto.phone != null)
            data.phone = dto.phone.trim() || null;
        if (dto.email != null)
            data.email = dto.email.trim().toLowerCase() || null;
        if (dto.whatsapp != null)
            data.whatsapp = dto.whatsapp.trim() || null;
        if (dto.website != null) {
            if (dto.website && !(0, listing_constants_1.isSafeHttpUrl)(dto.website))
                throw new common_1.BadRequestException('Website must be a valid http(s) URL');
            data.website = dto.website.trim() || null;
        }
        if (dto.city != null)
            data.city = dto.city.trim() || null;
        if (dto.state != null)
            data.state = dto.state.trim() || null;
        if (dto.area != null)
            data.area = dto.area.trim() || null;
        if (dto.address != null)
            data.address = dto.address.trim() || null;
        if (dto.latitude != null)
            data.latitude = dto.latitude;
        if (dto.longitude != null)
            data.longitude = dto.longitude;
        if (dto.business_hours != null)
            data.business_hours = dto.business_hours;
        if (dto.languages != null)
            data.languages = this.limitList(dto.languages, listing_constants_1.FREE_LISTING_LIMITS.languages);
        if (dto.services != null)
            data.services = this.limitList(dto.services, listing_constants_1.FREE_LISTING_LIMITS.services);
        if (dto.social_links != null)
            data.social_links = this.sanitizeSocial(dto.social_links);
        if (dto.gallery != null) {
            data.gallery = this.limitList(dto.gallery.filter((url) => (0, listing_constants_1.isSafeHttpUrl)(url)), listing_constants_1.FREE_LISTING_LIMITS.gallery);
        }
        if (dto.portfolio != null)
            data.portfolio = dto.portfolio;
        if (dto.logo_url != null) {
            if (dto.logo_url && !(0, listing_constants_1.isSafeHttpUrl)(dto.logo_url))
                throw new common_1.BadRequestException('Invalid logo URL');
            data.logo_url = dto.logo_url || null;
        }
        if (dto.cover_image_url != null) {
            if (dto.cover_image_url && !(0, listing_constants_1.isSafeHttpUrl)(dto.cover_image_url))
                throw new common_1.BadRequestException('Invalid cover URL');
            data.cover_image_url = dto.cover_image_url || null;
        }
        if (dto.is_visible != null)
            data.is_visible = dto.is_visible;
        if (dto.is_phone_public != null)
            data.is_phone_public = dto.is_phone_public;
        if (dto.is_email_public != null)
            data.is_email_public = dto.is_email_public;
        if (dto.is_whatsapp_public != null)
            data.is_whatsapp_public = dto.is_whatsapp_public;
        if (dto.is_address_public != null)
            data.is_address_public = dto.is_address_public;
        if (dto.is_website_public != null)
            data.is_website_public = dto.is_website_public;
        if (dto.slug) {
            const next = (0, discovery_constants_1.slugify)(dto.slug);
            if (!next)
                throw new common_1.BadRequestException('Invalid slug');
            if (next !== listing.slug) {
                await this.assertSlugAvailable(next, listing.id);
                data.slug = next;
            }
        }
        const updated = await this.prisma.freeListing.update({ where: { id: listing.id }, data });
        return this.formatOwner(updated);
    }
    async publish(userId, id) {
        const listing = await this.requireOwner(userId, id);
        this.assertPublishable(listing);
        const updated = await this.prisma.freeListing.update({
            where: { id: listing.id },
            data: { status: 'PENDING_REVIEW', is_visible: false, rejection_reason: null },
        });
        await this.notifications
            .notifyAdmins({
            title: 'New listing submitted for review',
            message: `${updated.name} was submitted as a ${updated.type.toLowerCase()} listing.`,
            type: 'SYSTEM',
            entityType: 'FREE_LISTING',
            entityId: updated.id,
        })
            .catch(() => undefined);
        return this.formatOwner(updated);
    }
    async unpublish(userId, id) {
        const listing = await this.requireOwner(userId, id);
        const updated = await this.prisma.freeListing.update({
            where: { id: listing.id },
            data: { is_visible: false },
        });
        return this.formatOwner(updated);
    }
    async archive(userId, id) {
        const listing = await this.requireOwner(userId, id);
        const updated = await this.prisma.freeListing.update({
            where: { id: listing.id },
            data: { status: 'ARCHIVED', is_visible: false },
        });
        return this.formatOwner(updated);
    }
    async uploadImage(userId, file) {
        await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        return this.storage.uploadProfileImage({ userId, file });
    }
    async getEnquiries(userId) {
        const listing = await this.prisma.freeListing.findUnique({ where: { owner_user_id: userId } });
        if (!listing)
            return [];
        return this.prisma.freeListingEnquiry.findMany({
            where: { listing_id: listing.id },
            orderBy: { created_at: 'desc' },
            take: 100,
        });
    }
    async getAnalytics(userId) {
        const listing = await this.prisma.freeListing.findUnique({ where: { owner_user_id: userId } });
        if (!listing) {
            return { views: 0, enquiries: 0, contacts: 0, searches: 0 };
        }
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [enquiries, events] = await Promise.all([
            this.prisma.freeListingEnquiry.count({ where: { listing_id: listing.id } }),
            this.prisma.discoveryEvent.groupBy({
                by: ['event_type'],
                where: { listing_id: listing.id, created_at: { gte: since } },
                _count: true,
            }),
        ]);
        const countOf = (type) => events.find((row) => row.event_type === type)?._count ?? 0;
        return {
            views: listing.profile_views,
            enquiries,
            contacts: countOf('contact_click') + countOf('call_click') + countOf('whatsapp_click'),
            searches: countOf('search'),
            last30Days: Object.fromEntries(events.map((row) => [row.event_type, row._count])),
        };
    }
    async upgrade(userId, id) {
        const listing = await this.requireOwner(userId, id);
        const [brand, creator] = await Promise.all([
            this.prisma.brandProfile.findUnique({ where: { user_id: userId }, select: { id: true } }),
            this.prisma.creatorProfile.findUnique({ where: { user_id: userId }, select: { id: true } }),
        ]);
        const updated = await this.prisma.freeListing.update({
            where: { id: listing.id },
            data: {
                brand_profile_id: brand?.id ?? listing.brand_profile_id,
                creator_profile_id: creator?.id ?? listing.creator_profile_id,
            },
        });
        const account = this.accountKind(Boolean(brand), Boolean(creator));
        return {
            listing: this.formatOwner(updated),
            accountType: account,
            permissions: (0, listing_constants_1.listingPermissions)(account),
            linked: Boolean(brand || creator),
            message: brand || creator
                ? 'Your listing is connected to your Brand/Creator account. Public URL is unchanged.'
                : 'Create a Brand or Creator account to unlock campaigns, payments, and team tools. Your listing stays live.',
        };
    }
    async searchPublic(query) {
        const page = query.page ?? 1;
        const limit = Math.min(100, query.limit ?? 20);
        const parsed = (0, discovery_constants_1.parseLocationFromQuery)(query.q || query.search || '');
        const keyword = parsed.keyword?.trim() || '';
        const city = query.city || parsed.city;
        const area = query.area || parsed.area;
        const category = query.category?.trim();
        const type = (query.type || 'all').toLowerCase();
        const verifiedOnly = query.verified === 'true' || query.verified === '1';
        const includeBusiness = type === 'all' || type === 'business' || type === 'brand';
        const includeCreator = type === 'all' || type === 'creator';
        const where = {
            status: 'PUBLISHED',
            is_visible: true,
        };
        if (includeBusiness && !includeCreator)
            where.type = 'BUSINESS';
        if (includeCreator && !includeBusiness)
            where.type = 'CREATOR';
        if (verifiedOnly)
            where.verified = true;
        if (city)
            where.city = { equals: city, mode: 'insensitive' };
        if (area)
            where.area = { contains: area, mode: 'insensitive' };
        if (category) {
            where.OR = [
                { category: { contains: category, mode: 'insensitive' } },
                { subcategory: { contains: category, mode: 'insensitive' } },
            ];
        }
        if (keyword) {
            const keywordFilter = {
                OR: [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { short_description: { contains: keyword, mode: 'insensitive' } },
                    { description: { contains: keyword, mode: 'insensitive' } },
                    { category: { contains: keyword, mode: 'insensitive' } },
                    { services: { has: keyword } },
                ],
            };
            where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), keywordFilter];
        }
        const listings = await this.prisma.freeListing.findMany({
            where,
            include: { owner: true },
            take: 200,
        });
        const listingCards = listings.map((row) => this.formatPublicCard(row));
        let accountCards = [];
        try {
            const existing = await this.discovery.search({ ...query, page: 1, limit: 80 });
            accountCards = (existing.data ?? []).map((item) => ({ ...item, source: 'ACCOUNT' }));
        }
        catch {
            accountCards = [];
        }
        const seen = new Set();
        const merged = [...listingCards, ...accountCards].filter((item) => {
            const key = `${String(item.type)}:${String(item.slug)}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        merged.sort((a, b) => {
            const aRec = a;
            const bRec = b;
            switch (query.sort) {
                case 'newest':
                case 'recently_added':
                    return +new Date(String(bRec.createdAt)) - +new Date(String(aRec.createdAt));
                case 'name':
                case 'name_asc':
                    return String(aRec.name).localeCompare(String(bRec.name));
                case 'popular':
                case 'most_popular':
                    return Number(bRec.profileViews ?? bRec.popularity ?? 0) - Number(aRec.profileViews ?? aRec.popularity ?? 0);
                default:
                    return Number(Boolean(bRec.featured)) - Number(Boolean(aRec.featured)) || Number(Boolean(bRec.verified)) - Number(Boolean(aRec.verified));
            }
        });
        void this.trackEvent({ event_type: 'search', query: keyword || undefined, city, category }).catch(() => undefined);
        const total = merged.length;
        const data = merged.slice((page - 1) * limit, page * limit);
        return { data, pagination: (0, pagination_query_dto_1.paginationMeta)(page, limit, total), meta: (0, pagination_query_dto_1.paginationMeta)(page, limit, total) };
    }
    async getCategories(type) {
        return this.discovery.getCategories(type);
    }
    async getLocations() {
        const [base, listingCities] = await Promise.all([
            this.discovery.getLocations(),
            this.prisma.freeListing.findMany({
                where: { status: 'PUBLISHED', is_visible: true, city: { not: null } },
                select: { city: true, state: true, area: true },
                take: 400,
            }),
        ]);
        const map = new Map(base.map((row) => [row.name.toLowerCase(), { ...row, areas: [...row.areas] }]));
        for (const row of listingCities) {
            const name = row.city?.trim();
            if (!name)
                continue;
            const key = name.toLowerCase();
            const existing = map.get(key) ?? { name, state: row.state || '', slug: (0, discovery_constants_1.slugify)(name), areas: [] };
            if (row.state && !existing.state)
                existing.state = row.state;
            if (row.area && !existing.areas.includes(row.area))
                existing.areas.push(row.area);
            map.set(key, existing);
        }
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }
    async getPublic(type, slug) {
        const listingType = type.toUpperCase() === 'CREATOR' ? 'CREATOR' : 'BUSINESS';
        const normalized = decodeURIComponent(slug).trim().toLowerCase();
        const listing = await this.prisma.freeListing.findFirst({
            where: { slug: normalized, type: listingType },
            include: { owner: true },
        });
        if (listing) {
            if (listing.status !== 'PUBLISHED' || !listing.is_visible) {
                throw new common_1.NotFoundException('This listing is currently unavailable.');
            }
            await this.prisma.freeListing.update({
                where: { id: listing.id },
                data: { profile_views: { increment: 1 } },
            });
            void this.trackEvent({ event_type: 'profile_view', listing_type: listing.type, listing_id: listing.id }).catch(() => undefined);
            return this.formatPublicDetail(listing);
        }
        return this.discovery.getBySlug(normalized);
    }
    async createEnquiry(idOrSlug, dto, authHeader, ip) {
        if (dto.website_url?.trim())
            return { success: true };
        if (!dto.name?.trim() || !dto.email?.trim() || !dto.message?.trim()) {
            throw new common_1.BadRequestException('Name, email and message are required');
        }
        const listing = await this.findPublished(idOrSlug);
        if (!listing) {
            return this.discovery.createEnquiry(idOrSlug, dto, authHeader, ip);
        }
        const since = new Date(Date.now() - 60 * 60 * 1000);
        const recent = await this.prisma.freeListingEnquiry.count({
            where: {
                created_at: { gte: since },
                OR: [{ email: dto.email.trim().toLowerCase() }, { listing_id: listing.id }],
            },
        });
        if (recent >= 8)
            throw new common_1.BadRequestException('Too many enquiries. Please try again later.');
        const senderUserId = await this.optionalUserId(authHeader);
        const enquiry = await this.prisma.freeListingEnquiry.create({
            data: {
                listing_id: listing.id,
                sender_user_id: senderUserId,
                name: dto.name.trim(),
                email: dto.email.trim().toLowerCase(),
                phone: dto.phone?.trim() || null,
                message: `${dto.message.trim()}${ip ? `\n\n[ip:${ip}]` : ''}`,
            },
        });
        await this.notifications
            .create({
            userId: listing.owner_user_id,
            title: 'New enquiry received for your listing.',
            message: `${dto.name.trim()} sent an enquiry from ViralBridge Discover.`,
            type: 'SYSTEM',
            entityType: 'FREE_LISTING_ENQUIRY',
            entityId: enquiry.id,
            metadata: { listingId: listing.id },
        })
            .catch(() => undefined);
        void this.trackEvent({ event_type: 'enquiry_sent', listing_type: listing.type, listing_id: listing.id }).catch(() => undefined);
        return { success: true, id: enquiry.id };
    }
    async report(idOrSlug, dto) {
        const listing = await this.findAny(idOrSlug);
        const report = await this.prisma.freeListingReport.create({
            data: {
                listing_id: listing?.id ?? null,
                target_id: listing?.id || idOrSlug,
                target_type: listing?.type || 'UNKNOWN',
                reason: dto.reason,
                details: dto.details?.trim() || null,
            },
        });
        await this.notifications
            .notifyAdmins({
            title: 'Listing reported',
            message: `A listing was reported for ${dto.reason}.`,
            type: 'SYSTEM',
            entityType: 'FREE_LISTING_REPORT',
            entityId: report.id,
        })
            .catch(() => undefined);
        return { success: true };
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
        const page = query.page ?? 1;
        const limit = Math.min(100, query.limit ?? 20);
        const keyword = (query.q || query.search || '').trim();
        const status = query.status && query.status !== 'all' && query.status !== 'active' ? query.status.toUpperCase() : undefined;
        const where = {};
        if (status)
            where.status = status;
        if (query.type && query.type !== 'all') {
            where.type = query.type.toUpperCase() === 'CREATOR' ? 'CREATOR' : 'BUSINESS';
        }
        if (query.city)
            where.city = { equals: query.city, mode: 'insensitive' };
        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { slug: { contains: keyword, mode: 'insensitive' } },
                { city: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        const [total, rows] = await Promise.all([
            this.prisma.freeListing.count({ where }),
            this.prisma.freeListing.findMany({
                where,
                include: { owner: true, _count: { select: { enquiries: true, reports: true } } },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data: rows.map((row) => ({
                ...this.formatOwner(row),
                ownerEmail: row.owner.email,
                ownerName: row.owner.name,
                enquiryCount: row._count.enquiries,
                reportCount: row._count.reports,
            })),
            pagination: (0, pagination_query_dto_1.paginationMeta)(page, limit, total),
        };
    }
    async adminUpdate(id, body, adminId) {
        const listing = await this.prisma.freeListing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        const nextStatus = body.status ?? listing.status;
        const updated = await this.prisma.freeListing.update({
            where: { id },
            data: {
                status: nextStatus,
                verified: body.verified ?? listing.verified,
                is_featured: body.is_featured ?? listing.is_featured,
                is_visible: body.is_visible ?? (nextStatus === 'PUBLISHED' ? true : listing.is_visible),
                rejection_reason: body.rejection_reason ?? listing.rejection_reason,
                published_at: nextStatus === 'PUBLISHED' ? listing.published_at ?? new Date() : listing.published_at,
            },
        });
        if (body.status && body.status !== listing.status) {
            const title = body.status === 'PUBLISHED'
                ? 'Your listing was approved'
                : body.status === 'REJECTED'
                    ? 'Your listing was rejected'
                    : body.status === 'SUSPENDED'
                        ? 'Your listing was suspended'
                        : 'Listing status updated';
            await this.notifications
                .create({
                userId: listing.owner_user_id,
                title,
                message: body.rejection_reason || `Status is now ${updated.status}.`,
                type: 'SYSTEM',
                entityType: 'FREE_LISTING',
                entityId: listing.id,
                metadata: { adminId, status: updated.status },
            })
                .catch(() => undefined);
        }
        return this.formatOwner(updated);
    }
    async adminReports() {
        return this.prisma.freeListingReport.findMany({
            orderBy: { created_at: 'desc' },
            take: 100,
            include: { listing: { select: { id: true, name: true, slug: true, type: true, status: true } } },
        });
    }
    async adminAnalytics() {
        const [published, drafts, suspended, enquiries, reports] = await Promise.all([
            this.prisma.freeListing.count({ where: { status: 'PUBLISHED' } }),
            this.prisma.freeListing.count({ where: { status: 'DRAFT' } }),
            this.prisma.freeListing.count({ where: { status: 'SUSPENDED' } }),
            this.prisma.freeListingEnquiry.count(),
            this.prisma.freeListingReport.count({ where: { status: 'OPEN' } }),
        ]);
        return { published, drafts, suspended, enquiries, openReports: reports };
    }
    async requireOwner(userId, id) {
        const listing = await this.prisma.freeListing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (listing.owner_user_id !== userId)
            throw new common_1.ForbiddenException('You do not own this listing');
        return listing;
    }
    async findPublished(idOrSlug) {
        const value = decodeURIComponent(idOrSlug).trim();
        return this.prisma.freeListing.findFirst({
            where: {
                OR: [{ id: value }, { slug: value.toLowerCase() }],
                status: 'PUBLISHED',
                is_visible: true,
            },
        });
    }
    async findAny(idOrSlug) {
        const value = decodeURIComponent(idOrSlug).trim();
        return this.prisma.freeListing.findFirst({
            where: { OR: [{ id: value }, { slug: value.toLowerCase() }] },
        });
    }
    assertPublishable(listing) {
        if (!listing.name?.trim())
            throw new common_1.BadRequestException('Name is required to publish');
        if (!listing.category?.trim())
            throw new common_1.BadRequestException('Category is required to publish');
        if (!listing.city?.trim())
            throw new common_1.BadRequestException('City is required to publish');
        if (!listing.short_description?.trim())
            throw new common_1.BadRequestException('Short description is required to publish');
        if (!listing.phone && !listing.email && !listing.whatsapp) {
            throw new common_1.BadRequestException('Add at least one contact method before publishing');
        }
    }
    async uniqueSlug(name) {
        const base = (0, discovery_constants_1.slugify)(name) || `listing-${Date.now().toString(36)}`;
        let slug = base;
        let i = 2;
        while (!(await this.slugFree(slug))) {
            slug = `${base}-${i}`;
            i += 1;
        }
        return slug;
    }
    async assertSlugAvailable(slug, currentId) {
        if (!(await this.slugFree(slug, currentId))) {
            throw new common_1.BadRequestException('That public URL is already taken');
        }
    }
    async slugFree(slug, currentId) {
        const [listing, brand, creator] = await Promise.all([
            this.prisma.freeListing.findUnique({ where: { slug } }),
            this.prisma.brandProfile.findFirst({ where: { slug } }),
            this.prisma.creatorProfile.findFirst({ where: { slug } }),
        ]);
        if (listing && listing.id !== currentId)
            return false;
        if (brand || creator)
            return false;
        return true;
    }
    limitList(values, max) {
        return values.map((item) => item.trim()).filter(Boolean).slice(0, max);
    }
    sanitizeSocial(links) {
        const next = {};
        for (const [key, value] of Object.entries(links || {})) {
            if (typeof value === 'string' && (0, listing_constants_1.isSafeHttpUrl)(value) && value.trim())
                next[key] = value.trim();
        }
        return next;
    }
    accountKind(hasBrand, hasCreator) {
        if (hasBrand)
            return 'BRAND';
        if (hasCreator)
            return 'CREATOR';
        return 'FREE_LISTING';
    }
    followerFilterForBudget(min, max) {
        if (min == null && max == null)
            return null;
        const toFollowers = (budget) => {
            if (budget <= 5000)
                return 15000;
            if (budget <= 15000)
                return 80000;
            if (budget <= 50000)
                return 250000;
            return 10000000;
        };
        const filter = {};
        if (min != null && min > 0)
            filter.gte = Math.round(toFollowers(min) * 0.2);
        if (max != null)
            filter.lte = toFollowers(max);
        return filter;
    }
    estimatedBudgetLabel(followers) {
        if (followers < 15000)
            return 'Under ₹5,000';
        if (followers < 80000)
            return '₹5,000 – ₹15,000';
        if (followers < 250000)
            return '₹15,000 – ₹50,000';
        return '₹50,000+';
    }
    formatOwner(row) {
        return {
            id: row.id,
            type: row.type,
            name: row.name,
            slug: row.slug,
            logo_url: row.logo_url,
            cover_image_url: row.cover_image_url,
            short_description: row.short_description,
            description: row.description,
            category: row.category,
            subcategory: row.subcategory,
            phone: row.phone,
            email: row.email,
            whatsapp: row.whatsapp,
            website: row.website,
            city: row.city,
            state: row.state,
            area: row.area,
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude,
            business_hours: row.business_hours,
            languages: row.languages,
            services: row.services,
            social_links: row.social_links,
            gallery: row.gallery,
            portfolio: row.portfolio,
            status: row.status,
            verified: row.verified,
            is_featured: row.is_featured,
            is_visible: row.is_visible,
            is_phone_public: row.is_phone_public,
            is_email_public: row.is_email_public,
            is_whatsapp_public: row.is_whatsapp_public,
            is_address_public: row.is_address_public,
            is_website_public: row.is_website_public,
            profile_views: row.profile_views,
            rejection_reason: row.rejection_reason,
            published_at: row.published_at,
            brand_profile_id: row.brand_profile_id,
            creator_profile_id: row.creator_profile_id,
            publicPath: `/discover/${row.type === 'CREATOR' ? 'creator' : 'business'}/${row.slug}`,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    formatPublicCard(row) {
        const ownerVerified = Boolean(row.owner?.is_verified);
        return {
            id: row.id,
            type: row.type,
            source: 'LISTING',
            name: row.name,
            slug: row.slug,
            logo: row.logo_url || '',
            coverImage: row.cover_image_url || '',
            shortDescription: row.short_description || '',
            category: row.category || 'Services',
            subcategory: row.subcategory || '',
            city: row.city || '',
            state: row.state || '',
            area: row.area || '',
            locationLabel: [row.area, row.city].filter(Boolean).join(', '),
            verified: Boolean(row.verified || ownerVerified),
            featured: Boolean(row.is_featured),
            rating: 0,
            reviewCount: 0,
            services: row.services ?? [],
            tags: (row.services ?? []).slice(0, 3),
            discoveryStatus: row.status,
            createdAt: row.created_at,
            profileViews: row.profile_views,
            publicPath: `/discover/${row.type === 'CREATOR' ? 'creator' : 'business'}/${row.slug}`,
        };
    }
    formatPublicDetail(row) {
        const card = this.formatPublicCard(row);
        return {
            ...card,
            description: row.description || row.short_description || '',
            website: row.is_website_public ? row.website : undefined,
            languages: row.languages,
            gallery: row.gallery,
            businessHours: row.business_hours,
            latitude: row.is_address_public ? row.latitude : null,
            longitude: row.is_address_public ? row.longitude : null,
            claimed: Boolean(row.brand_profile_id || row.creator_profile_id),
            socialLinks: row.social_links || {},
            contact: {
                phone: row.is_phone_public ? row.phone : null,
                email: row.is_email_public ? row.email : null,
                whatsapp: row.is_whatsapp_public ? row.whatsapp : null,
                website: row.is_website_public ? row.website : null,
                address: row.is_address_public ? row.address : null,
            },
        };
    }
    async optionalUserId(authHeader) {
        if (!authHeader?.startsWith('Bearer '))
            return null;
        try {
            const payload = await this.jwt.verifyAsync(authHeader.slice(7), {
                secret: process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026',
            });
            return payload.sub ?? null;
        }
        catch {
            return null;
        }
    }
};
exports.ListingService = ListingService;
exports.ListingService = ListingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        discovery_service_1.DiscoveryService,
        storage_service_1.StorageService,
        jwt_1.JwtService])
], ListingService);
//# sourceMappingURL=listing.service.js.map