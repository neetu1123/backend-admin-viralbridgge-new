import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WalletService } from '../payments/wallet.service';
import { EscrowService } from '../payments/escrow.service';
import { DeliverablesService } from '../payments/deliverables.service';
import { RazorpayService } from '../payments/razorpay.service';
import { BrandCampaignQueryDto, CampaignDto, CreatorDiscoveryQueryDto, FundsDto, NotificationQueryDto, SendMessageDto, TransactionQueryDto, UpdateBrandProfileDto } from './brand.dto';
export declare class BrandService {
    private prisma;
    private matchingService;
    private notifications;
    private walletService;
    private escrowService;
    private deliverablesService;
    private razorpayService;
    constructor(prisma: PrismaService, matchingService: MatchingService, notifications: NotificationsService, walletService: WalletService, escrowService: EscrowService, deliverablesService: DeliverablesService, razorpayService: RazorpayService);
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
    }>;
    updateProfile(userId: string, dto: UpdateBrandProfileDto): Promise<{
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
    }>;
    createCampaign(userId: string, dto: CampaignDto): Promise<{
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
    getCampaigns(userId: string, query: BrandCampaignQueryDto): Promise<{
        data: ({
            applications: ({
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
            })[];
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
    }>;
    getCampaign(userId: string, id: string): Promise<{
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
        applications: ({
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
        })[];
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
    getCampaignDetail(userId: string, id: string): Promise<{
        campaign: ({
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
            applications: ({
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
                deliverables: {
                    id: string;
                    campaign_id: string;
                    creator_id: string;
                    status: string;
                    updated_at: Date;
                    title: string;
                    created_at: Date;
                    type: string | null;
                    file_url: string | null;
                    submitted_at: Date | null;
                    reviewed_at: Date | null;
                    notes: string | null;
                    application_id: string | null;
                    media_url: string | null;
                    thumbnail_url: string | null;
                    revision_notes: string | null;
                    version: number;
                    due_date: Date | null;
                    auto_release_at: Date | null;
                }[];
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
            escrows: ({
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
            })[];
            campaignDeliverables: ({
                application: {
                    message: string | null;
                    id: string;
                    campaign_id: string;
                    creator_id: string;
                    status: string;
                    updated_at: Date;
                    created_at: Date;
                    proposed_price: number | null;
                } | null;
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
                id: string;
                campaign_id: string;
                creator_id: string;
                status: string;
                updated_at: Date;
                title: string;
                created_at: Date;
                type: string | null;
                file_url: string | null;
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                version: number;
                due_date: Date | null;
                auto_release_at: Date | null;
            })[];
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
        }) | null;
        applicants: ({
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
            deliverables: {
                id: string;
                campaign_id: string;
                creator_id: string;
                status: string;
                updated_at: Date;
                title: string;
                created_at: Date;
                type: string | null;
                file_url: string | null;
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                version: number;
                due_date: Date | null;
                auto_release_at: Date | null;
            }[];
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
        approvedCreators: ({
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
            deliverables: {
                id: string;
                campaign_id: string;
                creator_id: string;
                status: string;
                updated_at: Date;
                title: string;
                created_at: Date;
                type: string | null;
                file_url: string | null;
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                version: number;
                due_date: Date | null;
                auto_release_at: Date | null;
            }[];
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
        deliverables: ({
            application: {
                message: string | null;
                id: string;
                campaign_id: string;
                creator_id: string;
                status: string;
                updated_at: Date;
                created_at: Date;
                proposed_price: number | null;
            } | null;
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
            id: string;
            campaign_id: string;
            creator_id: string;
            status: string;
            updated_at: Date;
            title: string;
            created_at: Date;
            type: string | null;
            file_url: string | null;
            submitted_at: Date | null;
            reviewed_at: Date | null;
            notes: string | null;
            application_id: string | null;
            media_url: string | null;
            thumbnail_url: string | null;
            revision_notes: string | null;
            version: number;
            due_date: Date | null;
            auto_release_at: Date | null;
        })[];
        payments: ({
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
        })[];
    }>;
    updateCampaign(userId: string, id: string, dto: CampaignDto): Promise<{
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
    deleteCampaign(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getCampaignRecommendations(userId: string, campaignId: string): Promise<{
        enabled: boolean;
        recommendations: {
            id: string;
            name: string;
            niche: string;
            followers: number;
            engagementRate: number;
            matchScore: number;
            matchReason: string;
            reasons: string[];
            platform: string;
            verified: boolean;
        }[];
    }>;
    getApplicants(userId: string, campaignId: string): Promise<({
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
    })[]>;
    updateApplication(userId: string, applicationId: string, status: string): Promise<{
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
    inviteCreator(userId: string, campaignId: string, creatorId: string): Promise<{
        success: boolean;
    }>;
    getCreators(query: CreatorDiscoveryQueryDto): Promise<{
        data: ({
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
            applications: ({
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
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyCreators(userId: string, query: CreatorDiscoveryQueryDto): Promise<{
        data: ({
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
                applications: ({
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
            deliverables: {
                id: string;
                campaign_id: string;
                creator_id: string;
                status: string;
                updated_at: Date;
                title: string;
                created_at: Date;
                type: string | null;
                file_url: string | null;
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                version: number;
                due_date: Date | null;
                auto_release_at: Date | null;
            }[];
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
    getCampaignDeliverables(userId: string, campaignId: string): Promise<({
        application: {
            message: string | null;
            id: string;
            campaign_id: string;
            creator_id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            proposed_price: number | null;
        } | null;
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
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        title: string;
        created_at: Date;
        type: string | null;
        file_url: string | null;
        submitted_at: Date | null;
        reviewed_at: Date | null;
        notes: string | null;
        application_id: string | null;
        media_url: string | null;
        thumbnail_url: string | null;
        revision_notes: string | null;
        version: number;
        due_date: Date | null;
        auto_release_at: Date | null;
    })[]>;
    reviewDeliverable(userId: string, deliverableId: string, status: string, notes?: string): Promise<{
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
    listEscrows(userId: string): Promise<any[]>;
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
        }) | null;
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
    addFunds(userId: string, dto: FundsDto): Promise<{
        wallet: {
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
        };
        transaction: {
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
        };
    } | {
        wallet: {
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
        };
        alreadyProcessed: boolean;
    }>;
    createPaymentOrder(userId: string, amount: number): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: null;
        paymentOrderId: string;
        purpose: string;
        escrowId: string | null;
        mock: boolean;
    } | {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string | undefined;
        paymentOrderId: string;
        purpose: string;
        escrowId: string | null;
        mock: boolean;
    }>;
    verifyPayment(userId: string, dto: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{
        wallet: {
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
        };
        transaction: {
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
        };
    } | {
        wallet: {
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
        };
        alreadyProcessed: boolean;
    }>;
    getRazorpayKey(): {
        keyId: string | null;
    };
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
    })[]>;
    getConversations(userId: string): Promise<({
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
    private ensureBrandProfile;
    private ensureWallet;
    private getOwnedCampaign;
    private getOwnedConversation;
    private ensureAcceptedApplicationResources;
    private createNotification;
}
