import { AdminDiscoveryUpdateDto, DiscoverySearchQueryDto } from './discovery.dto';
import { DiscoveryService } from './discovery.service';
export declare class AdminDiscoveryController {
    private readonly discovery;
    constructor(discovery: DiscoveryService);
    list(query: DiscoverySearchQueryDto): Promise<{
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
    analytics(): Promise<{
        searches: number;
        views: number;
        contacts: number;
        enquiries: number;
        topCities: never[] | (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.DiscoveryEventGroupByOutputType, "city"[]> & {
            _count: {
                _all: number;
            };
        })[];
        topCategories: never[] | (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.DiscoveryEventGroupByOutputType, "category"[]> & {
            _count: {
                _all: number;
            };
        })[];
    }>;
    categories(): Promise<{
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
    update(type: string, id: string, body: AdminDiscoveryUpdateDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        success: boolean;
    }>;
}
