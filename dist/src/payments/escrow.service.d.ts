import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEscrowDto, OpenDisputeDto } from './dto/escrow.dto';
import { WalletService } from './wallet.service';
export declare class EscrowService {
    private readonly prisma;
    private readonly wallet;
    private readonly notifications;
    constructor(prisma: PrismaService, wallet: WalletService, notifications: NotificationsService);
    getEscrow(userId: string, escrowId: string): Promise<{
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
    listEscrows(userId: string, role: 'brand' | 'creator'): Promise<any[]>;
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
        amount: number;
        released_at: Date | null;
    }>;
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
        amount: number;
        released_at: Date | null;
    } | null>;
    private lockFundsForEscrow;
    releaseEscrow(userId: string, escrowId: string): Promise<{
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
    refundEscrow(userId: string, escrowId: string): Promise<{
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
    private formatEscrow;
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
