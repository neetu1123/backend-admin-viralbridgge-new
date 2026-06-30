import { CreatorService } from './creator.service';
import { ApplyCampaignDto, ApplicationQueryDto, CreatorCampaignQueryDto, NotificationQueryDto, SendMessageDto, SubmitDeliverableDto, TransactionQueryDto, UpdateCreatorProfileDto, UploadDto, WithdrawDto } from './creator.dto';
export declare class CreatorController {
    private readonly creatorService;
    constructor(creatorService: CreatorService);
    getProfile(req: any): Promise<{
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
    }>;
    updateProfile(req: any, body: UpdateCreatorProfileDto): Promise<{
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
    }>;
    uploadPhoto(req: any, body: UploadDto): Promise<{
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
    }>;
    uploadMediaKit(req: any, body: UploadDto): Promise<{
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
    }>;
    getCampaigns(req: any, query: CreatorCampaignQueryDto): Promise<{
        data: ({
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
            _count: {
                applications: number;
            };
        } & {
            id: string;
            status: string;
            updated_at: Date;
            brand_id: string;
            title: string;
            description: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            created_by_admin_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            created_at: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        aiMatchingEnabled: boolean;
    }>;
    getCampaign(id: string): Promise<{
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
        applications: {
            message: string | null;
            id: string;
            campaign_id: string;
            creator_id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            proposed_price: number | null;
        }[];
    } & {
        id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        title: string;
        description: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
        locality: string | null;
        languages: string[];
        created_by_admin_id: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date;
    }>;
    apply(req: any, campaignId: string, body: ApplyCampaignDto): Promise<{
        campaign: {
            id: string;
            status: string;
            updated_at: Date;
            brand_id: string;
            title: string;
            description: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            created_by_admin_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            created_at: Date;
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
    } & {
        message: string | null;
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        proposed_price: number | null;
    }>;
    getApplications(req: any, query: ApplicationQueryDto): Promise<{
        data: ({
            campaign: {
                brand: {
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
                status: string;
                updated_at: Date;
                brand_id: string;
                title: string;
                description: string;
                platform: string;
                budget: number;
                remaining_budget: number;
                deadline: Date;
                deliverables: string[];
                locality: string | null;
                languages: string[];
                created_by_admin_id: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                created_at: Date;
            };
        } & {
            message: string | null;
            id: string;
            campaign_id: string;
            creator_id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            proposed_price: number | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getApplication(req: any, id: string): Promise<{
        campaign: {
            brand: {
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
            status: string;
            updated_at: Date;
            brand_id: string;
            title: string;
            description: string;
            platform: string;
            budget: number;
            remaining_budget: number;
            deadline: Date;
            deliverables: string[];
            locality: string | null;
            languages: string[];
            created_by_admin_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            created_at: Date;
        };
    } & {
        message: string | null;
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        proposed_price: number | null;
    }>;
    getDashboard(req: any): Promise<{
        totalApplications: number;
        acceptedApplications: number;
        pendingApplications: number;
        walletBalance: number;
        earnings: number;
    }>;
    listEscrows(req: any): Promise<any[]>;
    getDeliverables(req: any): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }[]>;
    uploadDeliverable(req: any, files: {
        file?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
    }, body: {
        campaign_id?: string;
    }): Promise<import("../storage/storage.service").UploadResult>;
    submitDeliverableFile(req: any, id: string, files: {
        file?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
    }, body: {
        notes?: string;
    }): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }>;
    submitDeliverable(req: any, id: string, body: SubmitDeliverableDto): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }>;
    getWallet(req: any): Promise<{
        id: string;
        userId: string;
        available_balance: number;
        locked_balance: number;
        pending_balance: number;
        lifetime_earnings: number;
        currency: string;
        is_frozen: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    withdraw(req: any, body: WithdrawDto): Promise<{
        id: string;
        creatorId: string;
        amount: number;
        status: string;
        transactionId: string | null | undefined;
        requestedAt: string;
        approvedAt: string | null;
        rejectedAt: string | null;
        rejectionReason: string | null;
    }>;
    getWalletTransactions(req: any, query: TransactionQueryDto): Promise<{
        data: {
            id: string;
            status: string;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getConversations(req: any): Promise<({
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
    } & {
        id: string;
        creator_id: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
    })[]>;
    getMessages(req: any, conversationId: string): Promise<({
        sender: {
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
    sendMessage(req: any, body: SendMessageDto): Promise<{
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
    getUnreadNotificationCount(req: any): Promise<{
        count: number;
    }>;
    markAllNotificationsRead(req: any): Promise<{
        success: boolean;
    }>;
    getNotifications(req: any, query: NotificationQueryDto): Promise<{
        data: {
            id: string;
            user_id: string;
            type: string;
            title: string;
            message: string;
            entity_type: string | null;
            entity_id: string | null;
            is_read: boolean;
            created_at: Date;
            metadata: {} | null;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markNotificationRead(req: any, id: string): Promise<{
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        entity_type: string | null;
        entity_id: string | null;
        is_read: boolean;
        created_at: Date;
        metadata: {} | null;
    }>;
    getSettings(req: any): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    updateSettings(req: any, body: Record<string, any>): Promise<{
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
    }>;
}
