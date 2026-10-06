import { CreateEscrowDto, EscrowActionDto, EscrowRefundDto, OpenDisputeDto } from './dto/escrow.dto';
import { EscrowService } from './escrow.service';
export declare class EscrowController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    create(req: {
        user: {
            id: string;
        };
    }, body: CreateEscrowDto): Promise<{
        campaign: {
            title: string;
        };
        creator: {
            user: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            updated_at: Date;
            locality: string | null;
            languages: string[];
            created_at: Date;
            user_id: string;
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            contact_email: string | null;
            phone: string | null;
            photo: string | null;
            slug: string | null;
            cover_image: string | null;
            category: string | null;
            subcategory: string | null;
            city: string | null;
            state: string | null;
            area: string | null;
            gallery: string[];
            rating: number;
            review_count: number;
            featured: boolean;
            discovery_status: string;
            is_phone_public: boolean;
            is_email_public: boolean;
            whatsapp: string | null;
            is_whatsapp_public: boolean;
        };
        brand: {
            user: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            updated_at: Date;
            description: string | null;
            created_at: Date;
            user_id: string;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            contact_email: string | null;
            phone: string | null;
            slug: string | null;
            cover_image: string | null;
            category: string | null;
            subcategory: string | null;
            city: string | null;
            state: string | null;
            area: string | null;
            gallery: string[];
            rating: number;
            review_count: number;
            featured: boolean;
            discovery_status: string;
            is_phone_public: boolean;
            is_email_public: boolean;
            whatsapp: string | null;
            is_whatsapp_public: boolean;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            location: string | null;
            short_description: string | null;
            services: string[];
            address: string | null;
            latitude: number | null;
            longitude: number | null;
            business_hours: import("@prisma/client/runtime/library").JsonValue | null;
            established_year: number | null;
            is_address_public: boolean;
        };
    } & {
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        platform_fee_percent: number;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        platform_fee: number;
        amount: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    get(req: {
        user: {
            id: string;
        };
    }, id: string): Promise<{
        id: unknown;
        campaignId: unknown;
        campaignTitle: string | undefined;
        brandId: unknown;
        creatorId: unknown;
        amount: number;
        platformFee: number;
        platformFeePercent: number;
        brandTotal: number;
        creatorPayout: number;
        status: unknown;
        lockedAt: {} | null;
        createdAt: string;
        releasedAt: {} | null;
    }>;
    release(req: {
        user: {
            id: string;
        };
    }, body: EscrowActionDto): Promise<{
        campaign: {
            title: string;
        };
        creator: {
            user: {
                id: string;
            };
        } & {
            id: string;
            updated_at: Date;
            locality: string | null;
            languages: string[];
            created_at: Date;
            user_id: string;
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            contact_email: string | null;
            phone: string | null;
            photo: string | null;
            slug: string | null;
            cover_image: string | null;
            category: string | null;
            subcategory: string | null;
            city: string | null;
            state: string | null;
            area: string | null;
            gallery: string[];
            rating: number;
            review_count: number;
            featured: boolean;
            discovery_status: string;
            is_phone_public: boolean;
            is_email_public: boolean;
            whatsapp: string | null;
            is_whatsapp_public: boolean;
        };
        brand: {
            user: {
                id: string;
            };
        } & {
            id: string;
            updated_at: Date;
            description: string | null;
            created_at: Date;
            user_id: string;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            contact_email: string | null;
            phone: string | null;
            slug: string | null;
            cover_image: string | null;
            category: string | null;
            subcategory: string | null;
            city: string | null;
            state: string | null;
            area: string | null;
            gallery: string[];
            rating: number;
            review_count: number;
            featured: boolean;
            discovery_status: string;
            is_phone_public: boolean;
            is_email_public: boolean;
            whatsapp: string | null;
            is_whatsapp_public: boolean;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            location: string | null;
            short_description: string | null;
            services: string[];
            address: string | null;
            latitude: number | null;
            longitude: number | null;
            business_hours: import("@prisma/client/runtime/library").JsonValue | null;
            established_year: number | null;
            is_address_public: boolean;
        };
    } & {
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        platform_fee_percent: number;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        platform_fee: number;
        amount: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    refund(req: {
        user: {
            id: string;
        };
    }, body: EscrowRefundDto): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        platform_fee_percent: number;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        platform_fee: number;
        amount: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    dispute(req: {
        user: {
            id: string;
            role?: {
                name: string;
            };
        };
    }, body: OpenDisputeDto): Promise<{
        id: string;
        campaignId: string;
        campaignTitle: string;
        creator: string;
        brand: string;
        reason: string;
        raisedBy: string;
        status: string;
        openedAt: string;
    }>;
}
