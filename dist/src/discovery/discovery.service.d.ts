import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminDiscoveryUpdateDto, DiscoveryEnquiryDto, DiscoveryEventDto, DiscoverySearchQueryDto } from './discovery.dto';
type ListingType = 'BUSINESS' | 'CREATOR';
export declare class DiscoveryService {
    private prisma;
    private notifications;
    private jwt;
    constructor(prisma: PrismaService, notifications: NotificationsService, jwt: JwtService);
    ensureCategories(): Promise<void>;
    getCategories(type?: string): Promise<{
        name: string;
        id: string;
        status: string;
        updated_at: Date;
        description: string | null;
        created_at: Date;
        slug: string;
        type: string;
        icon: string | null;
        sort_order: number;
    }[]>;
    getLocations(): Promise<{
        name: string;
        state: string;
        slug: string;
        areas: string[];
    }[]>;
    search(query: DiscoverySearchQueryDto, options?: {
        includeHidden?: boolean;
    }): Promise<{
        data: {
            id: any;
            type: ListingType;
            name: any;
            slug: any;
            logo: any;
            coverImage: any;
            shortDescription: any;
            category: any;
            subcategory: any;
            city: any;
            state: any;
            area: any;
            locationLabel: string;
            verified: boolean;
            featured: boolean;
            rating: number;
            reviewCount: any;
            services: any;
            tags: any;
            discoveryStatus: any;
            createdAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getBySlug(slug: string): Promise<{
        description: any;
        website: string;
        contact: {
            phone: any;
            email: any;
            whatsapp: any;
            website: string;
            address: any;
        };
        gallery: any;
        services: any;
        businessHours: any;
        establishedYear: any;
        socialLinks: Record<string, string>;
        campaigns: any;
        id: any;
        type: ListingType;
        name: any;
        slug: any;
        logo: any;
        coverImage: any;
        shortDescription: any;
        category: any;
        subcategory: any;
        city: any;
        state: any;
        area: any;
        locationLabel: string;
        verified: boolean;
        featured: boolean;
        rating: number;
        reviewCount: any;
        tags: any;
        discoveryStatus: any;
        createdAt: any;
        popularity: any;
    } | {
        description: any;
        languages: any;
        followers: any;
        engagement: any;
        portfolio: any;
        gallery: any;
        socialLinks: Record<string, string>;
        contact: {
            phone: any;
            email: any;
            whatsapp: any;
            website: null;
            address: null;
        };
        id: any;
        type: ListingType;
        name: any;
        slug: any;
        logo: any;
        coverImage: any;
        shortDescription: any;
        category: any;
        subcategory: any;
        city: any;
        state: any;
        area: any;
        locationLabel: string;
        verified: boolean;
        featured: boolean;
        rating: number;
        reviewCount: any;
        services: never[];
        tags: string[];
        discoveryStatus: any;
        createdAt: any;
        popularity: any;
    }>;
    createEnquiry(slugOrId: string, dto: DiscoveryEnquiryDto, authHeader?: string, ip?: string): Promise<{
        success: boolean;
        id?: undefined;
    } | {
        success: boolean;
        id: string;
    }>;
    trackEvent(dto: DiscoveryEventDto): Promise<{
        success: boolean;
    }>;
    adminList(query: DiscoverySearchQueryDto): Promise<{
        data: {
            id: any;
            type: ListingType;
            name: any;
            slug: any;
            logo: any;
            coverImage: any;
            shortDescription: any;
            category: any;
            subcategory: any;
            city: any;
            state: any;
            area: any;
            locationLabel: string;
            verified: boolean;
            featured: boolean;
            rating: number;
            reviewCount: any;
            services: any;
            tags: any;
            discoveryStatus: any;
            createdAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    adminUpdate(id: string, type: string, body: AdminDiscoveryUpdateDto, adminId: string): Promise<{
        success: boolean;
    }>;
    adminAnalytics(): Promise<{
        searches: number;
        views: number;
        contacts: number;
        enquiries: number;
        topCities: never[] | (Prisma.PickEnumerable<Prisma.DiscoveryEventGroupByOutputType, "city"[]> & {
            _count: {
                _all: number;
            };
        })[];
        topCategories: never[] | (Prisma.PickEnumerable<Prisma.DiscoveryEventGroupByOutputType, "category"[]> & {
            _count: {
                _all: number;
            };
        })[];
    }>;
    private findBrands;
    private findCreators;
    private score;
    private formatBrandCard;
    private formatCreatorCard;
    private formatBrandDetail;
    private formatCreatorDetail;
    private publicSocial;
    private safeWebsite;
    private resolveCategoryTerm;
    private cityFromLocation;
    private unslug;
    private resolveListing;
    private optionalUserId;
}
export {};
