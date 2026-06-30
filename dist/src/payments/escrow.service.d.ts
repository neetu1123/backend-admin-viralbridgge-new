import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEscrowDto, OpenDisputeDto } from './dto/escrow.dto';
import { WalletService } from './wallet.service';
import { PlatformWalletService } from './platform-wallet.service';
export declare class EscrowService {
    private readonly prisma;
    private readonly wallet;
    private readonly platformWallet;
    private readonly notifications;
    constructor(prisma: PrismaService, wallet: WalletService, platformWallet: PlatformWalletService, notifications: NotificationsService);
    calculatePlatformFee(amount: number): number;
    getEscrow(userId: string, escrowId: string): Promise<{
        id: unknown;
        campaignId: unknown;
        campaignTitle: string | undefined;
        brandId: unknown;
        creatorId: unknown;
        amount: unknown;
        platformFee: {};
        creatorPayout: number;
        status: unknown;
        lockedAt: {} | null;
        createdAt: string;
        releasedAt: {} | null;
    }>;
    getEscrowForCampaignCreator(campaignId: string, creatorId: string): Promise<({
        campaign: {
            title: string;
        };
        creator: {
            user: {
                name: string;
                id: string;
                status: string;
                updated_at: Date;
                created_at: Date;
                firebase_uid: string | null;
                password: string | null;
                email: string;
                avatar: string | null;
                role_id: string | null;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
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
                status: string;
                updated_at: Date;
                created_at: Date;
                firebase_uid: string | null;
                password: string | null;
                email: string;
                avatar: string | null;
                role_id: string | null;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
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
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }) | null>;
    listEscrows(userId: string, role: 'brand' | 'creator'): Promise<any[]>;
    listAdminEscrows(status?: string): Promise<{
        id: unknown;
        campaignId: unknown;
        campaignTitle: string | undefined;
        brandId: unknown;
        creatorId: unknown;
        amount: unknown;
        platformFee: {};
        creatorPayout: number;
        status: unknown;
        lockedAt: {} | null;
        createdAt: string;
        releasedAt: {} | null;
    }[]>;
    createEscrow(userId: string, dto: CreateEscrowDto): Promise<{
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
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    createPendingEscrowOnApplicationAccept(application: {
        campaign_id: string;
        creator_id: string;
        proposed_price?: number | null;
        campaign: {
            brand_id: string;
            budget: number;
            title: string;
            brand: {
                user_id: string;
            };
        };
        creator: {
            user_id: string;
        };
    }): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    } | null>;
    lockFundsOnApplicationAccept(application: {
        campaign_id: string;
        creator_id: string;
        proposed_price?: number | null;
        campaign: {
            brand_id: string;
            budget: number;
            title: string;
            brand: {
                user_id: string;
            };
        };
        creator: {
            user_id: string;
        };
    }): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    } | null>;
    private fundPendingEscrow;
    private lockFundsForEscrow;
    private notifyEscrowHeld;
    releaseEscrow(userId: string, escrowId: string, options?: {
        systemRelease?: boolean;
        reason?: string;
    }): Promise<{
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
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    adminReleaseEscrow(escrowId: string, reason?: string): Promise<{
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
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    adminRefundEscrow(escrowId: string): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    releaseEscrowByCampaignCreator(campaignId: string, creatorId: string, reason?: string): Promise<{
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
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    private releaseEscrowInternal;
    refundEscrow(userId: string, escrowId: string): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
        platform_fee: number;
        amount: number;
        platform_fee_percent: number;
        platform_fee_amount: number;
        creator_amount: number;
        payment_gateway: string | null;
        payment_id: string | null;
        locked_at: Date | null;
        funded_at: Date | null;
        released_at: Date | null;
        refunded_at: Date | null;
    }>;
    private refundEscrowInternal;
    openDispute(userId: string, role: 'brand' | 'creator', dto: OpenDisputeDto): Promise<{
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
    private openBrandDispute;
    private openCreatorDispute;
    private createDisputeRecord;
    private getEscrowWithRelations;
    private assertEscrowAccess;
    formatEscrow(escrow: Record<string, unknown>): {
        id: unknown;
        campaignId: unknown;
        campaignTitle: string | undefined;
        brandId: unknown;
        creatorId: unknown;
        amount: unknown;
        platformFee: {};
        creatorPayout: number;
        status: unknown;
        lockedAt: {} | null;
        createdAt: string;
        releasedAt: {} | null;
    };
    formatDispute(row: {
        id: string;
        campaign_id: string;
        creator_id: string;
        brand_id: string;
        reason: string;
        raised_by: string;
        status: string;
        created_at: Date;
        campaign?: {
            title?: string;
        } | null;
        creator?: {
            full_name?: string | null;
            user?: {
                name?: string | null;
            } | null;
        } | null;
        brand?: {
            company_name?: string | null;
            user?: {
                name?: string | null;
            } | null;
        } | null;
    }): {
        id: string;
        campaignId: string;
        campaignTitle: string;
        creator: string;
        brand: string;
        reason: string;
        raisedBy: string;
        status: string;
        openedAt: string;
    };
}
