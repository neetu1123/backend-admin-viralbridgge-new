import { DiscoveryEnquiryDto, DiscoveryEventDto, DiscoverySearchQueryDto } from './discovery.dto';
import { DiscoveryService } from './discovery.service';
export declare class DiscoveryController {
    private readonly discovery;
    constructor(discovery: DiscoveryService);
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
    search(query: DiscoverySearchQueryDto): Promise<{
        data: {
            id: any;
            type: "CREATOR" | "BUSINESS";
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
    track(body: DiscoveryEventDto): Promise<{
        success: boolean;
    }>;
    enquiry(slug: string, body: DiscoveryEnquiryDto, authorization?: string, req?: {
        ip?: string;
        headers?: Record<string, string | string[] | undefined>;
    }): Promise<{
        success: boolean;
        id?: undefined;
    } | {
        success: boolean;
        id: string;
    }>;
    getProfile(slug: string): Promise<{
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
        type: "CREATOR" | "BUSINESS";
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
        type: "CREATOR" | "BUSINESS";
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
}
