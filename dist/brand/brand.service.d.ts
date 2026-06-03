import { PrismaService } from '../prisma/prisma.service';
import { BrandCampaignQueryDto, CampaignDto, CreatorDiscoveryQueryDto, FundsDto, NotificationQueryDto, SendMessageDto, TransactionQueryDto, UpdateBrandProfileDto } from './brand.dto';
export declare class BrandService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            id: string;
            created_at: Date;
            updated_at: Date;
            firebase_uid: string | null;
            email: string;
            password: string | null;
            name: string;
            avatar: string | null;
            role_id: string | null;
            status: string;
            is_verified: boolean;
            is_banned: boolean;
            is_deleted: boolean;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        user_id: string;
        company_name: string;
        industry: string | null;
        website: string | null;
        description: string | null;
        logo: string | null;
        contact_email: string | null;
        phone: string | null;
        location: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateProfile(userId: string, dto: UpdateBrandProfileDto): Promise<{
        user: {
            id: string;
            created_at: Date;
            updated_at: Date;
            firebase_uid: string | null;
            email: string;
            password: string | null;
            name: string;
            avatar: string | null;
            role_id: string | null;
            status: string;
            is_verified: boolean;
            is_banned: boolean;
            is_deleted: boolean;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        user_id: string;
        company_name: string;
        industry: string | null;
        website: string | null;
        description: string | null;
        logo: string | null;
        contact_email: string | null;
        phone: string | null;
        location: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    createCampaign(userId: string, dto: CampaignDto): Promise<{
        id: string;
        description: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
        locality: string | null;
        languages: string[];
        brand_id: string;
    }>;
    getCampaigns(userId: string, query: BrandCampaignQueryDto): Promise<{
        data: ({
            applications: ({
                creator: {
                    user: {
                        id: string;
                        created_at: Date;
                        updated_at: Date;
                        firebase_uid: string | null;
                        email: string;
                        password: string | null;
                        name: string;
                        avatar: string | null;
                        role_id: string | null;
                        status: string;
                        is_verified: boolean;
                        is_banned: boolean;
                        is_deleted: boolean;
                        settings: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    id: string;
                    user_id: string;
                    contact_email: string | null;
                    phone: string | null;
                    created_at: Date;
                    updated_at: Date;
                    locality: string | null;
                    languages: string[];
                    full_name: string | null;
                    bio: string | null;
                    niche: string | null;
                    followers: number;
                    engagement_rate: number;
                    social_links: import("@prisma/client/runtime/library").JsonValue | null;
                    media_kit: string | null;
                    portfolio: string | null;
                    photo: string | null;
                };
            } & {
                id: string;
                created_at: Date;
                updated_at: Date;
                status: string;
                creator_id: string;
                campaign_id: string;
                message: string | null;
                proposed_price: number | null;
            })[];
        } & {
            id: string;
            description: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            brand_id: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCampaign(userId: string, id: string): Promise<{
        brand: {
            id: string;
            user_id: string;
            company_name: string;
            industry: string | null;
            website: string | null;
            description: string | null;
            logo: string | null;
            contact_email: string | null;
            phone: string | null;
            location: string | null;
            created_at: Date;
            updated_at: Date;
        };
        applications: ({
            creator: {
                user: {
                    id: string;
                    created_at: Date;
                    updated_at: Date;
                    firebase_uid: string | null;
                    email: string;
                    password: string | null;
                    name: string;
                    avatar: string | null;
                    role_id: string | null;
                    status: string;
                    is_verified: boolean;
                    is_banned: boolean;
                    is_deleted: boolean;
                    settings: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                id: string;
                user_id: string;
                contact_email: string | null;
                phone: string | null;
                created_at: Date;
                updated_at: Date;
                locality: string | null;
                languages: string[];
                full_name: string | null;
                bio: string | null;
                niche: string | null;
                followers: number;
                engagement_rate: number;
                social_links: import("@prisma/client/runtime/library").JsonValue | null;
                media_kit: string | null;
                portfolio: string | null;
                photo: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            creator_id: string;
            campaign_id: string;
            message: string | null;
            proposed_price: number | null;
        })[];
    } & {
        id: string;
        description: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
        locality: string | null;
        languages: string[];
        brand_id: string;
    }>;
    getCampaignDetail(userId: string, id: string): Promise<{
        campaign: {
            id: string;
            description: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            brand_id: string;
        } | null;
        applicants: any;
        approvedCreators: any;
        deliverables: any;
        payments: any;
    }>;
    updateCampaign(userId: string, id: string, dto: CampaignDto): Promise<{
        id: string;
        description: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
        locality: string | null;
        languages: string[];
        brand_id: string;
    }>;
    deleteCampaign(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getApplicants(userId: string, campaignId: string): Promise<({
        campaign: {
            id: string;
            description: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            brand_id: string;
        };
        creator: {
            user: {
                id: string;
                created_at: Date;
                updated_at: Date;
                firebase_uid: string | null;
                email: string;
                password: string | null;
                name: string;
                avatar: string | null;
                role_id: string | null;
                status: string;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            user_id: string;
            contact_email: string | null;
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            locality: string | null;
            languages: string[];
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            photo: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        creator_id: string;
        campaign_id: string;
        message: string | null;
        proposed_price: number | null;
    })[]>;
    updateApplication(userId: string, applicationId: string, status: string): Promise<{
        campaign: {
            id: string;
            description: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            brand_id: string;
        };
        creator: {
            user: {
                id: string;
                created_at: Date;
                updated_at: Date;
                firebase_uid: string | null;
                email: string;
                password: string | null;
                name: string;
                avatar: string | null;
                role_id: string | null;
                status: string;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            user_id: string;
            contact_email: string | null;
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            locality: string | null;
            languages: string[];
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            photo: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        creator_id: string;
        campaign_id: string;
        message: string | null;
        proposed_price: number | null;
    }>;
    inviteCreator(userId: string, campaignId: string, creatorId: string): Promise<{
        success: boolean;
    }>;
    getCreators(query: CreatorDiscoveryQueryDto): Promise<{
        data: ({
            user: {
                id: string;
                created_at: Date;
                updated_at: Date;
                firebase_uid: string | null;
                email: string;
                password: string | null;
                name: string;
                avatar: string | null;
                role_id: string | null;
                status: string;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
            applications: ({
                campaign: {
                    id: string;
                    description: string;
                    created_at: Date;
                    updated_at: Date;
                    status: string;
                    title: string;
                    platform: string;
                    budget: number;
                    remaining_budget: number;
                    deadline: Date;
                    deliverables: string[];
                    locality: string | null;
                    languages: string[];
                    brand_id: string;
                };
            } & {
                id: string;
                created_at: Date;
                updated_at: Date;
                status: string;
                creator_id: string;
                campaign_id: string;
                message: string | null;
                proposed_price: number | null;
            })[];
        } & {
            id: string;
            user_id: string;
            contact_email: string | null;
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            locality: string | null;
            languages: string[];
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            photo: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyCreators(userId: string, query: CreatorDiscoveryQueryDto): Promise<{
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            creator_id: string;
            campaign_id: string;
            message: string | null;
            proposed_price: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCampaignDeliverables(userId: string, campaignId: string): Promise<any>;
    reviewDeliverable(userId: string, deliverableId: string, status: string, notes?: string): Promise<any>;
    releaseEscrow(userId: string, escrowId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        brand_id: string;
        creator_id: string;
        campaign_id: string;
        amount: number;
    }>;
    getDashboard(userId: string): Promise<{
        totalCampaigns: number;
        activeCampaigns: number;
        pendingApprovals: number;
        budgetUsed: number;
        budgetRemaining: number;
        topCampaign: ({
            _count: {
                applications: number;
            };
        } & {
            id: string;
            description: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            brand_id: string;
        }) | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        available_balance: number;
        pending_balance: number;
    }>;
    addFunds(userId: string, dto: FundsDto): Promise<{
        wallet: {
            id: string;
            user_id: string;
            created_at: Date;
            updated_at: Date;
            available_balance: number;
            pending_balance: number;
        };
        transaction: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            amount: number;
            type: string;
            reference_id: string | null;
            wallet_id: string;
        };
    }>;
    getWalletTransactions(userId: string, query: TransactionQueryDto): Promise<{
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            amount: number;
            type: string;
            reference_id: string | null;
            wallet_id: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAnalytics(userId: string): Promise<{
        campaigns: number;
        applications: number;
        spend: number;
    }>;
    getRoi(userId: string): Promise<{
        roi: number;
        campaigns: number;
        applications: number;
        spend: number;
    }>;
    getTopCreators(userId: string): Promise<({
        creator: {
            user: {
                id: string;
                created_at: Date;
                updated_at: Date;
                firebase_uid: string | null;
                email: string;
                password: string | null;
                name: string;
                avatar: string | null;
                role_id: string | null;
                status: string;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            user_id: string;
            contact_email: string | null;
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            locality: string | null;
            languages: string[];
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            photo: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        creator_id: string;
        campaign_id: string;
        message: string | null;
        proposed_price: number | null;
    })[]>;
    getConversations(userId: string): Promise<({
        messages: {
            id: string;
            created_at: Date;
            message: string;
            conversation_id: string;
            sender_id: string;
            read_at: Date | null;
        }[];
        creator: {
            user: {
                id: string;
                created_at: Date;
                updated_at: Date;
                firebase_uid: string | null;
                email: string;
                password: string | null;
                name: string;
                avatar: string | null;
                role_id: string | null;
                status: string;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            user_id: string;
            contact_email: string | null;
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            locality: string | null;
            languages: string[];
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            photo: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        brand_id: string;
        creator_id: string;
    })[]>;
    getMessages(userId: string, conversationId: string): Promise<({
        sender: {
            id: string;
            created_at: Date;
            updated_at: Date;
            firebase_uid: string | null;
            email: string;
            password: string | null;
            name: string;
            avatar: string | null;
            role_id: string | null;
            status: string;
            is_verified: boolean;
            is_banned: boolean;
            is_deleted: boolean;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        created_at: Date;
        message: string;
        conversation_id: string;
        sender_id: string;
        read_at: Date | null;
    })[]>;
    sendMessage(userId: string, dto: SendMessageDto): Promise<{
        id: string;
        created_at: Date;
        message: string;
        conversation_id: string;
        sender_id: string;
        read_at: Date | null;
    }>;
    getNotifications(userId: string, query: NotificationQueryDto): Promise<{
        data: {
            id: string;
            user_id: string;
            created_at: Date;
            title: string;
            type: string | null;
            body: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            is_read: boolean;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markNotificationRead(userId: string, id: string): Promise<{
        id: string;
        user_id: string;
        created_at: Date;
        title: string;
        type: string | null;
        body: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        is_read: boolean;
    }>;
    getSettings(userId: string): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    updateSettings(userId: string, settings: Record<string, any>): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        firebase_uid: string | null;
        email: string;
        password: string | null;
        name: string;
        avatar: string | null;
        role_id: string | null;
        status: string;
        is_verified: boolean;
        is_banned: boolean;
        is_deleted: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    private ensureBrandProfile;
    private ensureWallet;
    private getOwnedCampaign;
    private getOwnedConversation;
    private ensureAcceptedApplicationResources;
    private createNotification;
}
