import { BrandService } from './brand.service';
import { BrandCampaignQueryDto, CampaignDto, CreatorDiscoveryQueryDto, FundsDto, NotificationQueryDto, RevisionDto, SendMessageDto, TransactionQueryDto, UpdateBrandProfileDto } from './brand.dto';
export declare class BrandController {
    private readonly brandService;
    constructor(brandService: BrandService);
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, body: UpdateBrandProfileDto): Promise<{
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
    createCampaign(req: any, body: CampaignDto): Promise<{
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
    getCampaigns(req: any, query: BrandCampaignQueryDto): Promise<{
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
    getCampaign(req: any, id: string): Promise<{
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
    getCampaignDetail(req: any, id: string): Promise<{
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
    updateCampaign(req: any, id: string, body: CampaignDto): Promise<{
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
    deleteCampaign(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getApplicants(req: any, id: string): Promise<({
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
    approveApplication(req: any, id: string): Promise<{
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
    rejectApplication(req: any, id: string): Promise<{
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
    shortlistApplication(req: any, id: string): Promise<{
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
    inviteCreator(req: any, id: string, creatorId: string): Promise<{
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
    getMyCreators(req: any, query: CreatorDiscoveryQueryDto): Promise<{
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
    getCampaignDeliverables(req: any, id: string): Promise<any>;
    approveDeliverable(req: any, id: string): Promise<any>;
    reviseDeliverable(req: any, id: string, body: RevisionDto): Promise<any>;
    releaseEscrow(req: any, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        brand_id: string;
        creator_id: string;
        campaign_id: string;
        amount: number;
    }>;
    getDashboard(req: any): Promise<{
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
    getWallet(req: any): Promise<{
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        available_balance: number;
        pending_balance: number;
    }>;
    addFunds(req: any, body: FundsDto): Promise<{
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
    getWalletTransactions(req: any, query: TransactionQueryDto): Promise<{
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
    getAnalytics(req: any): Promise<{
        campaigns: number;
        applications: number;
        spend: number;
    }>;
    getRoi(req: any): Promise<{
        roi: number;
        campaigns: number;
        applications: number;
        spend: number;
    }>;
    getTopCreators(req: any): Promise<({
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
    getConversations(req: any): Promise<({
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
    getMessages(req: any, conversationId: string): Promise<({
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
    sendMessage(req: any, body: SendMessageDto): Promise<{
        id: string;
        created_at: Date;
        message: string;
        conversation_id: string;
        sender_id: string;
        read_at: Date | null;
    }>;
    getNotifications(req: any, query: NotificationQueryDto): Promise<{
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
    markNotificationRead(req: any, id: string): Promise<{
        id: string;
        user_id: string;
        created_at: Date;
        title: string;
        type: string | null;
        body: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        is_read: boolean;
    }>;
    getSettings(req: any): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    updateSettings(req: any, body: Record<string, any>): Promise<{
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
}
