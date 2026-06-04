import { BrandService } from './brand.service';
import { BrandCampaignQueryDto, CampaignDto, CreatorDiscoveryQueryDto, FundsDto, NotificationQueryDto, RevisionDto, SendMessageDto, TransactionQueryDto, UpdateBrandProfileDto } from './brand.dto';
export declare class BrandController {
    private readonly brandService;
    constructor(brandService: BrandService);
    getProfile(req: any): Promise<{
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
    }>;
    updateProfile(req: any, body: UpdateBrandProfileDto): Promise<{
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
    }>;
    createCampaign(req: any, body: CampaignDto): Promise<{
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
    getCampaigns(req: any, query: BrandCampaignQueryDto): Promise<{
        data: ({
            applications: ({
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
            })[];
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
    getCampaign(req: any, id: string): Promise<{
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
        applications: ({
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
        })[];
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
    getCampaignDetail(req: any, id: string): Promise<{
        campaign: ({
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
            escrows: ({
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
                id: string;
                status: string;
                created_at: Date;
                updated_at: Date;
                creator_id: string;
                brand_id: string;
                amount: number;
                campaign_id: string;
            })[];
            applications: ({
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
                deliverables: {
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
                }[];
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
            campaignDeliverables: ({
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
            })[];
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
        }) | null;
        applicants: ({
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
            deliverables: {
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
            }[];
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
        approvedCreators: ({
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
            deliverables: {
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
            }[];
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
        deliverables: ({
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
        })[];
        payments: ({
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
            id: string;
            status: string;
            created_at: Date;
            updated_at: Date;
            creator_id: string;
            brand_id: string;
            amount: number;
            campaign_id: string;
        })[];
    }>;
    updateCampaign(req: any, id: string, body: CampaignDto): Promise<{
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
    deleteCampaign(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getApplicants(req: any, id: string): Promise<({
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
    })[]>;
    approveApplication(req: any, id: string): Promise<{
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
    rejectApplication(req: any, id: string): Promise<{
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
    shortlistApplication(req: any, id: string): Promise<{
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
    inviteCreator(req: any, id: string, creatorId: string): Promise<{
        success: boolean;
    }>;
    getCreators(query: CreatorDiscoveryQueryDto): Promise<{
        data: ({
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
            applications: ({
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
                applications: ({
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
            deliverables: {
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
            }[];
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
    getCampaignDeliverables(req: any, id: string): Promise<({
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
    approveDeliverable(req: any, id: string): Promise<{
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
    reviseDeliverable(req: any, id: string, body: RevisionDto): Promise<{
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
    releaseEscrow(req: any, id: string): Promise<{
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        brand_id: string;
        amount: number;
        campaign_id: string;
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
        }) | null;
    }>;
    getWallet(req: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
    }>;
    addFunds(req: any, body: FundsDto): Promise<{
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
    getWalletTransactions(req: any, query: TransactionQueryDto): Promise<{
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
    })[]>;
    getConversations(req: any): Promise<({
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
        id: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        brand_id: string;
    })[]>;
    getMessages(req: any, conversationId: string): Promise<({
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
    getNotifications(req: any, query: NotificationQueryDto): Promise<{
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
    markNotificationRead(req: any, id: string): Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        type: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        body: string;
        is_read: boolean;
    }>;
    getSettings(req: any): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    updateSettings(req: any, body: Record<string, any>): Promise<{
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
}
