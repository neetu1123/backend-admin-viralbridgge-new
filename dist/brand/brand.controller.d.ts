import { BrandService } from './brand.service';
import { BrandCampaignQueryDto, CampaignDto, CreatorDiscoveryQueryDto, FundsDto, NotificationQueryDto, RevisionDto, SendMessageDto, TransactionQueryDto, UpdateBrandProfileDto } from './brand.dto';
export declare class BrandController {
    private readonly brandService;
    constructor(brandService: BrandService);
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
    updateProfile(req: any, body: UpdateBrandProfileDto): Promise<{
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
    createCampaign(req: any, body: CampaignDto): Promise<{
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
        created_at: Date;
    }>;
    getCampaigns(req: any, query: BrandCampaignQueryDto): Promise<{
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
            created_at: Date;
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
        created_at: Date;
    }>;
    getCampaignDetail(req: any, id: string): Promise<{
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
                    submitted_at: Date | null;
                    reviewed_at: Date | null;
                    notes: string | null;
                    application_id: string | null;
                    media_url: string | null;
                    thumbnail_url: string | null;
                    revision_notes: string | null;
                    due_date: Date | null;
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
                amount: number;
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
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                due_date: Date | null;
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
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                due_date: Date | null;
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
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                due_date: Date | null;
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
            submitted_at: Date | null;
            reviewed_at: Date | null;
            notes: string | null;
            application_id: string | null;
            media_url: string | null;
            thumbnail_url: string | null;
            revision_notes: string | null;
            due_date: Date | null;
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
            amount: number;
        })[];
    }>;
    updateCampaign(req: any, id: string, body: CampaignDto): Promise<{
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
        created_at: Date;
    }>;
    deleteCampaign(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getApplicants(req: any, id: string): Promise<({
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
    getCampaignRecommendations(req: any, id: string): Promise<{
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
    approveApplication(req: any, id: string): Promise<{
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
    rejectApplication(req: any, id: string): Promise<{
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
    shortlistApplication(req: any, id: string): Promise<{
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
    inviteCreator(req: any, id: string, creatorId: string): Promise<{
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
    getMyCreators(req: any, query: CreatorDiscoveryQueryDto): Promise<{
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
                submitted_at: Date | null;
                reviewed_at: Date | null;
                notes: string | null;
                application_id: string | null;
                media_url: string | null;
                thumbnail_url: string | null;
                revision_notes: string | null;
                due_date: Date | null;
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
    getCampaignDeliverables(req: any, id: string): Promise<({
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
        submitted_at: Date | null;
        reviewed_at: Date | null;
        notes: string | null;
        application_id: string | null;
        media_url: string | null;
        thumbnail_url: string | null;
        revision_notes: string | null;
        due_date: Date | null;
    })[]>;
    approveDeliverable(req: any, id: string): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        title: string;
        created_at: Date;
        type: string | null;
        submitted_at: Date | null;
        reviewed_at: Date | null;
        notes: string | null;
        application_id: string | null;
        media_url: string | null;
        thumbnail_url: string | null;
        revision_notes: string | null;
        due_date: Date | null;
    }>;
    reviseDeliverable(req: any, id: string, body: RevisionDto): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        title: string;
        created_at: Date;
        type: string | null;
        submitted_at: Date | null;
        reviewed_at: Date | null;
        notes: string | null;
        application_id: string | null;
        media_url: string | null;
        thumbnail_url: string | null;
        revision_notes: string | null;
        due_date: Date | null;
    }>;
    releaseEscrow(req: any, id: string): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        status: string;
        updated_at: Date;
        brand_id: string;
        created_at: Date;
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
            created_at: Date;
        }) | null;
    }>;
    getWallet(req: any): Promise<{
        id: string;
        updated_at: Date;
        created_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
    }>;
    addFunds(req: any, body: FundsDto): Promise<{
        wallet: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            reference_id: string | null;
        };
    }>;
    getWalletTransactions(req: any, query: TransactionQueryDto): Promise<{
        data: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
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
    getConversations(req: any): Promise<({
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
