import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getRoles(): Promise<({
        _count: {
            users: number;
        };
    } & {
        description: string | null;
        id: string;
        name: string;
    })[]>;
    createRole(body: {
        name: string;
        description: string;
    }, req: any): Promise<{
        description: string | null;
        id: string;
        name: string;
    }>;
    updateRole(id: string, body: {
        name: string;
        description: string;
    }, req: any): Promise<{
        description: string | null;
        id: string;
        name: string;
    }>;
    deleteRole(id: string, req: any): Promise<{
        description: string | null;
        id: string;
        name: string;
    }>;
    getAdmins(): Promise<({
        role: {
            description: string | null;
            id: string;
            name: string;
        } | null;
    } & {
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
    })[]>;
    assignRoleByEmail(body: {
        email: string;
        role_id: string;
        password?: string;
        name?: string;
    }, req: any): Promise<{
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
    getUsers(): Promise<({
        role: {
            description: string | null;
            id: string;
            name: string;
        } | null;
    } & {
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
    })[]>;
    getUser(id: string): Promise<{
        role: {
            description: string | null;
            id: string;
            name: string;
        } | null;
        creator_profile: {
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
        } | null;
        brand_profile: {
            description: string | null;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            contact_email: string | null;
            phone: string | null;
            location: string | null;
        } | null;
    } & {
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
    updateUserRole(id: string, body: {
        role_id: string;
    }, req: any): Promise<{
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
    banUser(id: string, req: any): Promise<{
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
    unbanUser(id: string, req: any): Promise<{
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
    getCampaigns(): Promise<({
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
            description: string | null;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            contact_email: string | null;
            phone: string | null;
            location: string | null;
        };
    } & {
        description: string;
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        languages: string[];
        locality: string | null;
        brand_id: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
    })[]>;
    getFlaggedCampaigns(): Promise<({
        brand: {
            description: string | null;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            company_name: string;
            industry: string | null;
            website: string | null;
            logo: string | null;
            contact_email: string | null;
            phone: string | null;
            location: string | null;
        };
    } & {
        description: string;
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        languages: string[];
        locality: string | null;
        brand_id: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
    })[]>;
    approveCampaign(id: string, req: any): Promise<{
        description: string;
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        languages: string[];
        locality: string | null;
        brand_id: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
    }>;
    rejectCampaign(id: string, req: any): Promise<{
        description: string;
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        languages: string[];
        locality: string | null;
        brand_id: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
    }>;
    flagCampaign(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
        description: string;
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        languages: string[];
        locality: string | null;
        brand_id: string;
        title: string;
        platform: string;
        budget: number;
        remaining_budget: number;
        deadline: Date;
        deliverables: string[];
    }>;
    getTransactions(): Promise<({
        wallet: {
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
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        created_at: Date;
        updated_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    })[]>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCampaigns: number;
        gmv: number;
        totalAuditLogs: number;
    }>;
    getAuditLogs(page?: string, limit?: string, entity?: string, action?: string, admin_id?: string): Promise<{
        data: ({
            admin: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            created_at: Date;
            action: string;
            entity: string;
            entity_id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    createAuditLog(body: {
        action: string;
        entity: string;
        entity_id: string;
        metadata?: any;
    }, req: any): Promise<{
        id: string;
        created_at: Date;
        action: string;
        entity: string;
        entity_id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        admin_id: string;
    } | undefined>;
}
