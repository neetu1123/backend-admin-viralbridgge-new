import { PrismaService } from '../prisma/prisma.service';
import { ApplyCampaignDto, ApplicationQueryDto, CreatorCampaignQueryDto, NotificationQueryDto, SendMessageDto, SubmitDeliverableDto, TransactionQueryDto, UpdateCreatorProfileDto, UploadDto, WithdrawDto } from './creator.dto';
export declare class CreatorService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            id: string;
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
            created_at: Date;
            updated_at: Date;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        contact_email: string | null;
        phone: string | null;
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
        photo: string | null;
    }>;
    updateProfile(userId: string, dto: UpdateCreatorProfileDto): Promise<{
        user: {
            id: string;
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
            created_at: Date;
            updated_at: Date;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        contact_email: string | null;
        phone: string | null;
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
        photo: string | null;
    }>;
    uploadPhoto(userId: string, dto: UploadDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        contact_email: string | null;
        phone: string | null;
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
        photo: string | null;
    }>;
    uploadMediaKit(userId: string, dto: UploadDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        contact_email: string | null;
        phone: string | null;
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
        photo: string | null;
    }>;
    getCampaigns(query: CreatorCampaignQueryDto): Promise<{
        data: ({
            brand: {
                user: {
                    id: string;
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
                    created_at: Date;
                    updated_at: Date;
                    settings: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                company_name: string;
                industry: string | null;
                website: string | null;
                description: string | null;
                logo: string | null;
                contact_email: string | null;
                phone: string | null;
                location: string | null;
            };
            _count: {
                applications: number;
            };
        } & {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
            description: string;
            languages: string[];
            locality: string | null;
            deliverables: string[];
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCampaign(id: string): Promise<{
        brand: {
            user: {
                id: string;
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
                created_at: Date;
                updated_at: Date;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            company_name: string;
            industry: string | null;
            website: string | null;
            description: string | null;
            logo: string | null;
            contact_email: string | null;
            phone: string | null;
            location: string | null;
        };
        applications: {
            message: string | null;
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            creator_id: string;
            campaign_id: string;
            proposed_price: number | null;
        }[];
    } & {
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        brand_id: string;
        description: string;
        languages: string[];
        locality: string | null;
        deliverables: string[];
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
    }>;
    apply(userId: string, campaignId: string, dto: ApplyCampaignDto): Promise<{
        campaign: {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
            description: string;
            languages: string[];
            locality: string | null;
            deliverables: string[];
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
        };
        creator: {
            user: {
                id: string;
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
                created_at: Date;
                updated_at: Date;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            contact_email: string | null;
            phone: string | null;
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
            photo: string | null;
        };
    } & {
        message: string | null;
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        campaign_id: string;
        proposed_price: number | null;
    }>;
    getApplications(userId: string, query: ApplicationQueryDto): Promise<{
        data: ({
            campaign: {
                brand: {
                    id: string;
                    created_at: Date;
                    updated_at: Date;
                    user_id: string;
                    company_name: string;
                    industry: string | null;
                    website: string | null;
                    description: string | null;
                    logo: string | null;
                    contact_email: string | null;
                    phone: string | null;
                    location: string | null;
                };
            } & {
                id: string;
                status: string;
                created_at: Date;
                updated_at: Date;
                brand_id: string;
                description: string;
                languages: string[];
                locality: string | null;
                deliverables: string[];
                title: string;
                platform: string;
                budget: number;
                remaining_budget: number;
                deadline: Date;
            };
        } & {
            message: string | null;
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            creator_id: string;
            campaign_id: string;
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
                created_at: Date;
                updated_at: Date;
                user_id: string;
                company_name: string;
                industry: string | null;
                website: string | null;
                description: string | null;
                logo: string | null;
                contact_email: string | null;
                phone: string | null;
                location: string | null;
            };
        } & {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
            description: string;
            languages: string[];
            locality: string | null;
            deliverables: string[];
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
        };
    } & {
        message: string | null;
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        campaign_id: string;
        proposed_price: number | null;
    }>;
    getDashboard(userId: string): Promise<{
        totalApplications: number;
        acceptedApplications: number;
        pendingApplications: number;
        walletBalance: number;
        earnings: number;
    }>;
    getDeliverables(userId: string): Promise<({
        campaign: {
            brand: {
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                company_name: string;
                industry: string | null;
                website: string | null;
                description: string | null;
                logo: string | null;
                contact_email: string | null;
                phone: string | null;
                location: string | null;
            };
        } & {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
            description: string;
            languages: string[];
            locality: string | null;
            deliverables: string[];
            title: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
        };
        application: {
            message: string | null;
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            creator_id: string;
            campaign_id: string;
            proposed_price: number | null;
        } | null;
    } & {
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        type: string | null;
        title: string;
        notes: string | null;
        campaign_id: string;
        application_id: string | null;
        media_url: string | null;
        thumbnail_url: string | null;
        revision_notes: string | null;
        due_date: Date | null;
        submitted_at: Date | null;
        reviewed_at: Date | null;
    })[]>;
    submitDeliverable(userId: string, deliverableId: string, dto: SubmitDeliverableDto): Promise<{
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        type: string | null;
        title: string;
        notes: string | null;
        campaign_id: string;
        application_id: string | null;
        media_url: string | null;
        thumbnail_url: string | null;
        revision_notes: string | null;
        due_date: Date | null;
        submitted_at: Date | null;
        reviewed_at: Date | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
    }>;
    withdraw(userId: string, dto: WithdrawDto): Promise<{
        wallet: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
        transaction: {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            reference_id: string | null;
        };
    }>;
    getWalletTransactions(userId: string, query: TransactionQueryDto): Promise<{
        data: {
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            reference_id: string | null;
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
            message: string;
            id: string;
            created_at: Date;
            type: string;
            file_url: string | null;
            file_name: string | null;
            file_size: string | null;
            read_at: Date | null;
            conversation_id: string;
            sender_id: string;
        }[];
        brand: {
            user: {
                id: string;
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
                created_at: Date;
                updated_at: Date;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            company_name: string;
            industry: string | null;
            website: string | null;
            description: string | null;
            logo: string | null;
            contact_email: string | null;
            phone: string | null;
            location: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        brand_id: string;
    })[]>;
    getMessages(userId: string, conversationId: string): Promise<({
        sender: {
            id: string;
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
            created_at: Date;
            updated_at: Date;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        message: string;
        id: string;
        created_at: Date;
        type: string;
        file_url: string | null;
        file_name: string | null;
        file_size: string | null;
        read_at: Date | null;
        conversation_id: string;
        sender_id: string;
    })[]>;
    sendMessage(userId: string, dto: SendMessageDto): Promise<{
        message: string;
        id: string;
        created_at: Date;
        type: string;
        file_url: string | null;
        file_name: string | null;
        file_size: string | null;
        read_at: Date | null;
        conversation_id: string;
        sender_id: string;
    }>;
    getNotifications(userId: string, query: NotificationQueryDto): Promise<{
        data: {
            id: string;
            created_at: Date;
            user_id: string;
            type: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            body: string;
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
        created_at: Date;
        user_id: string;
        type: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        body: string;
        is_read: boolean;
    }>;
    getSettings(userId: string): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    updateSettings(userId: string, settings: Record<string, any>): Promise<{
        id: string;
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
        created_at: Date;
        updated_at: Date;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    private ensureCreatorProfile;
    private ensureWallet;
    private getOwnedConversation;
    private createNotification;
}
