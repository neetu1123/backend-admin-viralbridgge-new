import { PrismaService } from '../prisma/prisma.service';
import { BrandCampaignQueryDto, CampaignDto, CreatorDiscoveryQueryDto, FundsDto, NotificationQueryDto, SendMessageDto, TransactionQueryDto, UpdateBrandProfileDto } from './brand.dto';
export declare class BrandService {
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
        company_name: string;
        industry: string | null;
        website: string | null;
        description: string | null;
        logo: string | null;
        contact_email: string | null;
        phone: string | null;
        location: string | null;
    }>;
    updateProfile(userId: string, dto: UpdateBrandProfileDto): Promise<{
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
    createCampaign(userId: string, dto: CampaignDto): Promise<{
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
    getCampaigns(userId: string, query: BrandCampaignQueryDto): Promise<{
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
    getCampaign(userId: string, id: string): Promise<{
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
    getCampaignDetail(userId: string, id: string): Promise<{
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
    updateCampaign(userId: string, id: string, dto: CampaignDto): Promise<{
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
    deleteCampaign(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getApplicants(userId: string, campaignId: string): Promise<({
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
    updateApplication(userId: string, applicationId: string, status: string): Promise<{
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
    inviteCreator(userId: string, campaignId: string, creatorId: string): Promise<{
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
    getMyCreators(userId: string, query: CreatorDiscoveryQueryDto): Promise<{
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
    getCampaignDeliverables(userId: string, campaignId: string): Promise<({
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
    reviewDeliverable(userId: string, deliverableId: string, status: string, notes?: string): Promise<{
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
    releaseEscrow(userId: string, escrowId: string): Promise<{
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        creator_id: string;
        brand_id: string;
        amount: number;
        campaign_id: string;
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
    getWallet(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
    }>;
    addFunds(userId: string, dto: FundsDto): Promise<{
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
    private ensureBrandProfile;
    private ensureWallet;
    private getOwnedCampaign;
    private getOwnedConversation;
    private ensureAcceptedApplicationResources;
    private createNotification;
}
