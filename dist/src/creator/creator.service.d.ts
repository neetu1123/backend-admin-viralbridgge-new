import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WithdrawalService } from '../payments/withdrawal.service';
import { WalletService } from '../payments/wallet.service';
import { EscrowService } from '../payments/escrow.service';
import { DeliverablesService } from '../payments/deliverables.service';
import { StorageService, type UploadedFilePayload } from '../storage/storage.service';
import { ApplyCampaignDto, ApplicationQueryDto, CreatorCampaignQueryDto, NotificationQueryDto, SendMessageDto, SubmitDeliverableDto, TransactionQueryDto, UpdateCreatorProfileDto, UploadDto, WithdrawDto } from './creator.dto';
export declare class CreatorService {
    private prisma;
    private matchingService;
    private notifications;
    private walletService;
    private withdrawalService;
    private deliverablesService;
    private escrowService;
    private storageService;
    constructor(prisma: PrismaService, matchingService: MatchingService, notifications: NotificationsService, walletService: WalletService, withdrawalService: WithdrawalService, deliverablesService: DeliverablesService, escrowService: EscrowService, storageService: StorageService);
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, dto: UpdateCreatorProfileDto): Promise<{
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
    uploadPhoto(userId: string, dto: UploadDto): Promise<{
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
    uploadPhotoFile(userId: string, file: UploadedFilePayload): Promise<{
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
    uploadMediaKit(userId: string, dto: UploadDto): Promise<{
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
    getCampaigns(userId: string | undefined, query: CreatorCampaignQueryDto): Promise<{
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
    apply(userId: string, campaignId: string, dto: ApplyCampaignDto): Promise<{
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
    getApplications(userId: string, query: ApplicationQueryDto): Promise<{
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
    getApplication(userId: string, id: string): Promise<{
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
    getDashboard(userId: string): Promise<{
        totalApplications: number;
        acceptedApplications: number;
        pendingApplications: number;
        walletBalance: number;
        earnings: number;
    }>;
    getDeliverables(userId: string): Promise<{
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
    listEscrows(userId: string): Promise<any[]>;
    uploadDeliverableMedia(userId: string, file: UploadedFilePayload, options?: {
        campaignId?: string;
        thumbnail?: UploadedFilePayload;
    }): Promise<import("../storage/storage.service").UploadResult>;
    submitDeliverableWithFile(userId: string, deliverableId: string, file: UploadedFilePayload, notes?: string, thumbnail?: UploadedFilePayload): Promise<{
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
    submitDeliverable(userId: string, deliverableId: string, dto: SubmitDeliverableDto): Promise<{
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
    getWallet(userId: string): Promise<{
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
    withdraw(userId: string, dto: WithdrawDto): Promise<{
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
    sendWithdrawOtp(userId: string): Promise<{
        sent: boolean;
        expiresAt: string;
    }>;
    getWalletTransactions(userId: string, query: TransactionQueryDto): Promise<{
        data: {
            id: string;
            status: string;
            updated_at: Date;
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
    getConversations(userId: string): Promise<({
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
    getMessages(userId: string, conversationId: string): Promise<({
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
    markNotificationRead(userId: string, id: string): Promise<{
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
    getUnreadNotificationCount(userId: string): Promise<{
        count: number;
    }>;
    markAllNotificationsRead(userId: string): Promise<{
        success: boolean;
    }>;
    getSettings(userId: string): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    updateSettings(userId: string, settings: Record<string, any>): Promise<{
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
    private ensureCreatorProfile;
    private ensureWallet;
    private getOwnedConversation;
    private createNotification;
}
