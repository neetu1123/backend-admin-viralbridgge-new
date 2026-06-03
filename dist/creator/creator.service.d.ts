import { PrismaService } from '../prisma/prisma.service';
import { ApplyCampaignDto, ApplicationQueryDto, CreatorCampaignQueryDto, NotificationQueryDto, SendMessageDto, SubmitDeliverableDto, TransactionQueryDto, UpdateCreatorProfileDto, UploadDto, WithdrawDto } from './creator.dto';
export declare class CreatorService {
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
        full_name: string | null;
        bio: string | null;
        niche: string | null;
        followers: number;
        engagement_rate: number;
        languages: string[];
        locality: string | null;
        social_links: import("@prisma/client/runtime/library").JsonValue | null;
        media_kit: string | null;
        portfolio: string | null;
        contact_email: string | null;
        phone: string | null;
        photo: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateProfile(userId: string, dto: UpdateCreatorProfileDto): Promise<{
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
        full_name: string | null;
        bio: string | null;
        niche: string | null;
        followers: number;
        engagement_rate: number;
        languages: string[];
        locality: string | null;
        social_links: import("@prisma/client/runtime/library").JsonValue | null;
        media_kit: string | null;
        portfolio: string | null;
        contact_email: string | null;
        phone: string | null;
        photo: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    uploadPhoto(userId: string, dto: UploadDto): Promise<{
        id: string;
        user_id: string;
        full_name: string | null;
        bio: string | null;
        niche: string | null;
        followers: number;
        engagement_rate: number;
        languages: string[];
        locality: string | null;
        social_links: import("@prisma/client/runtime/library").JsonValue | null;
        media_kit: string | null;
        portfolio: string | null;
        contact_email: string | null;
        phone: string | null;
        photo: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    uploadMediaKit(userId: string, dto: UploadDto): Promise<{
        id: string;
        user_id: string;
        full_name: string | null;
        bio: string | null;
        niche: string | null;
        followers: number;
        engagement_rate: number;
        languages: string[];
        locality: string | null;
        social_links: import("@prisma/client/runtime/library").JsonValue | null;
        media_kit: string | null;
        portfolio: string | null;
        contact_email: string | null;
        phone: string | null;
        photo: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    getCampaigns(query: CreatorCampaignQueryDto): Promise<{
        data: ({
            brand: {
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
                description: string | null;
                company_name: string;
                industry: string | null;
                website: string | null;
                logo: string | null;
                location: string | null;
            };
            _count: {
                applications: number;
            };
        } & {
            id: string;
            languages: string[];
            locality: string | null;
            created_at: Date;
            updated_at: Date;
            status: string;
            brand_id: string;
            title: string;
            description: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCampaign(id: string): Promise<{
        applications: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            creator_id: string;
            campaign_id: string;
            message: string | null;
            proposed_price: number | null;
        }[];
        brand: {
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
            description: string | null;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            location: string | null;
        };
    } & {
        id: string;
        languages: string[];
        locality: string | null;
        created_at: Date;
        updated_at: Date;
        status: string;
        brand_id: string;
        title: string;
        description: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
    }>;
    apply(userId: string, campaignId: string, dto: ApplyCampaignDto): Promise<{
        campaign: {
            id: string;
            languages: string[];
            locality: string | null;
            created_at: Date;
            updated_at: Date;
            status: string;
            brand_id: string;
            title: string;
            description: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
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
            full_name: string | null;
            bio: string | null;
            niche: string | null;
            followers: number;
            engagement_rate: number;
            languages: string[];
            locality: string | null;
            social_links: import("@prisma/client/runtime/library").JsonValue | null;
            media_kit: string | null;
            portfolio: string | null;
            contact_email: string | null;
            phone: string | null;
            photo: string | null;
            created_at: Date;
            updated_at: Date;
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
    getApplications(userId: string, query: ApplicationQueryDto): Promise<{
        data: ({
            campaign: {
                brand: {
                    id: string;
                    user_id: string;
                    contact_email: string | null;
                    phone: string | null;
                    created_at: Date;
                    updated_at: Date;
                    description: string | null;
                    company_name: string;
                    industry: string | null;
                    website: string | null;
                    logo: string | null;
                    location: string | null;
                };
            } & {
                id: string;
                languages: string[];
                locality: string | null;
                created_at: Date;
                updated_at: Date;
                status: string;
                brand_id: string;
                title: string;
                description: string;
                platform: string;
                budget: number;
                remaining_budget: number;
                deadline: Date;
                deliverables: string[];
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
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getApplication(userId: string, id: string): Promise<{
        campaign: {
            brand: {
                id: string;
                user_id: string;
                contact_email: string | null;
                phone: string | null;
                created_at: Date;
                updated_at: Date;
                description: string | null;
                company_name: string;
                industry: string | null;
                website: string | null;
                logo: string | null;
                location: string | null;
            };
        } & {
            id: string;
            languages: string[];
            locality: string | null;
            created_at: Date;
            updated_at: Date;
            status: string;
            brand_id: string;
            title: string;
            description: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
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
    getDashboard(userId: string): Promise<{
        totalApplications: number;
        acceptedApplications: number;
        pendingApplications: number;
        walletBalance: number;
        earnings: number;
    }>;
    getDeliverables(userId: string): Promise<any>;
    submitDeliverable(userId: string, deliverableId: string, dto: SubmitDeliverableDto): Promise<any>;
    getWallet(userId: string): Promise<{
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        available_balance: number;
        pending_balance: number;
    }>;
    withdraw(userId: string, dto: WithdrawDto): Promise<{
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
            type: string;
            amount: number;
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
            type: string;
            amount: number;
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
    getConversations(userId: string): Promise<({
        messages: {
            id: string;
            created_at: Date;
            message: string;
            conversation_id: string;
            sender_id: string;
            read_at: Date | null;
        }[];
        brand: {
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
            description: string | null;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            location: string | null;
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
    private ensureCreatorProfile;
    private ensureWallet;
    private getOwnedConversation;
    private createNotification;
}
