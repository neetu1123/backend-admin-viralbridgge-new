import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
export declare class AdminService {
    private prisma;
    private matchingService;
    constructor(prisma: PrismaService, matchingService: MatchingService);
    createAuditLog(params: {
        admin_id: string;
        action: string;
        entity: string;
        entity_id: string;
        metadata?: any;
    }): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date;
        action: string;
        entity: string;
        entity_id: string;
        admin_id: string;
    } | undefined>;
    getAuditLogs(query: {
        page?: number;
        limit?: number;
        entity?: string;
        action?: string;
        admin_id?: string;
    }): Promise<{
        data: ({
            admin: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            created_at: Date;
            action: string;
            entity: string;
            entity_id: string;
            admin_id: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAuditLogStats(): Promise<{
        total: number;
        today: number;
        byEntity: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AuditLogGroupByOutputType, "entity"[]> & {
            _count: {
                entity: number;
            };
        })[];
    }>;
    getRoles(): Promise<({
        _count: {
            users: number;
        };
    } & {
        name: string;
        id: string;
        description: string | null;
    })[]>;
    createRole(name: string, description: string, adminId?: string): Promise<{
        name: string;
        id: string;
        description: string | null;
    }>;
    updateRole(id: string, name: string, description: string, adminId?: string): Promise<{
        name: string;
        id: string;
        description: string | null;
    }>;
    deleteRole(id: string, adminId?: string): Promise<{
        name: string;
        id: string;
        description: string | null;
    }>;
    getAdmins(): Promise<({
        role: {
            name: string;
            id: string;
            description: string | null;
        } | null;
    } & {
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
    })[]>;
    assignRoleByEmail(params: {
        email: string;
        role_id: string;
        password?: string;
        name?: string;
    }, adminId?: string): Promise<{
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
    getUsers(): Promise<({
        role: {
            name: string;
            id: string;
            description: string | null;
        } | null;
        creator_profile: ({
            _count: {
                applications: number;
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
        }) | null;
        brand_profile: ({
            _count: {
                campaigns: number;
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
        }) | null;
        wallets: {
            available_balance: number;
            pending_balance: number;
        }[];
    } & {
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
    })[]>;
    getUser(id: string): Promise<{
        role: {
            name: string;
            id: string;
            description: string | null;
        } | null;
        creator_profile: {
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
        } | null;
        brand_profile: {
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
        } | null;
    } & {
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
    updateUserRole(id: string, role_id: string, adminId?: string): Promise<{
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
    banUser(id: string, adminId?: string): Promise<{
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
    unbanUser(id: string, adminId?: string): Promise<{
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
    getCampaigns(): Promise<({
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
    })[]>;
    getFlaggedCampaigns(): Promise<({
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
    })[]>;
    approveCampaign(id: string, adminId?: string): Promise<{
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
    getSettings(): Promise<{
        aiMatchingEnabled: boolean;
        updatedAt: Date;
    }>;
    updateSettings(body: {
        aiMatchingEnabled?: boolean;
    }, adminId?: string): Promise<{
        aiMatchingEnabled: any;
        updatedAt: any;
    }>;
    getMatches(): Promise<{
        enabled: boolean;
        matches: {
            id: string;
            campaignTitle: string;
            campaignId: string;
            creatorName: string;
            creatorNiche: string;
            matchScore: number;
            reasons: string[];
            status: string;
            matchedAt: string;
            engagement: number;
            followers: number;
        }[];
    }>;
    updateMatch(id: string, status: 'active' | 'removed' | 'forced', adminId?: string): Promise<{
        id: string;
        campaign_id: string;
        creator_id: string;
        match_score: number;
        reasons: string[];
        status: string;
        matched_at: Date;
    }>;
    runMatching(): Promise<{
        totalCreated: number;
        campaigns: number;
        enabled: boolean;
    }>;
    rejectCampaign(id: string, adminId?: string): Promise<{
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
    flagCampaign(id: string, reason: string, adminId?: string): Promise<{
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
    getTransactions(): Promise<({
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_platform: boolean;
            is_frozen: boolean;
        };
    } & {
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
    })[]>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCampaigns: number;
        gmv: number;
        totalAuditLogs: number;
    }>;
    getWithdrawals(status?: string): Promise<({
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_platform: boolean;
            is_frozen: boolean;
        };
    } & {
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
    })[]>;
    approveWithdrawal(id: string, adminId?: string): Promise<{
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_platform: boolean;
            is_frozen: boolean;
        };
    } & {
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
    }>;
    rejectWithdrawal(id: string, adminId?: string, reason?: string): Promise<{
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_platform: boolean;
            is_frozen: boolean;
        };
    } & {
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
    }>;
    private adminCampaignsModule;
    private auditCampaignForBrand;
    listBrands(query: {
        search?: string;
        industry?: string;
        status?: string;
        verified?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            userId: string;
            companyName: string;
            contactPerson: string;
            email: string;
            phone: string | null;
            website: string | null;
            industry: string | null;
            status: string;
            verified: boolean;
            campaignCount: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getBrandDetail(id: string): Promise<{
        profile: {
            id: string;
            userId: string;
            companyName: string;
            contactPerson: string;
            email: string;
            phone: string | null;
            website: string | null;
            industry: string | null;
            description: string | null;
            location: string | null;
            status: string;
            verified: boolean;
            memberSince: Date;
        };
        wallet: {
            availableBalance: number;
            pendingBalance: number;
        };
        kycStatus: string;
        activeCampaigns: {
            id: string;
            title: string;
            platform: string;
            budget: number;
            status: string;
            deadline: Date;
            applicants: number;
            createdAt: Date;
        }[];
        completedCampaigns: {
            id: string;
            title: string;
            platform: string;
            budget: number;
            status: string;
            deadline: Date;
            applicants: number;
            createdAt: Date;
        }[];
        totalCampaigns: number;
    }>;
    createCampaignForBrand(adminId: string, body: Record<string, unknown>): Promise<{
        campaign: {
            brand: {
                user: {
                    name: string;
                    id: string;
                    email: string;
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
        brand: {
            id: string;
            companyName: string;
            userId: string;
        };
    }>;
    createCampaignWithBrand(adminId: string, body: Record<string, unknown>): Promise<{
        campaign: {
            brand: {
                user: {
                    name: string;
                    id: string;
                    email: string;
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
        brand: {
            id: string;
            userId: string;
            companyName: string;
            email: string;
            tempPassword: string;
        };
        invitationNote: string;
    }>;
}
