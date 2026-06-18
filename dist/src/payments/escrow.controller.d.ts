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
            contact_email: string | null;
            phone: string | null;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            location: string | null;
        };
    } & {
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        amount: number;
        released_at: Date | null;
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
        amount: unknown;
        status: unknown;
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
            contact_email: string | null;
            phone: string | null;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            location: string | null;
        };
    } & {
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        amount: number;
        released_at: Date | null;
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
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        amount: number;
        released_at: Date | null;
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
