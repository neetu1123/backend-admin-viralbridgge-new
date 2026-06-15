import { AdminService } from './admin.service';
import { KycService } from '../kyc/kyc.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AdminController {
    private readonly adminService;
    private readonly kycService;
    private readonly notifications;
    constructor(adminService: AdminService, kycService: KycService, notifications: NotificationsService);
    getRoles(): Promise<({
        _count: {
            users: number;
        };
    } & {
        name: string;
        id: string;
        description: string | null;
    })[]>;
    createRole(body: {
        name: string;
        description: string;
    }, req: any): Promise<{
        name: string;
        id: string;
        description: string | null;
    }>;
    updateRole(id: string, body: {
        name: string;
        description: string;
    }, req: any): Promise<{
        name: string;
        id: string;
        description: string | null;
    }>;
    deleteRole(id: string, req: any): Promise<{
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
    assignRoleByEmail(body: {
        email: string;
        role_id: string;
        password?: string;
        name?: string;
    }, req: any): Promise<{
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
    updateUserRole(id: string, body: {
        role_id: string;
    }, req: any): Promise<{
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
    banUser(id: string, req: any): Promise<{
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
    unbanUser(id: string, req: any): Promise<{
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
    approveCampaign(id: string, req: any): Promise<{
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
    rejectCampaign(id: string, req: any): Promise<{
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
    flagCampaign(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
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
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
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
    getSettings(): Promise<{
        aiMatchingEnabled: boolean;
        updatedAt: Date;
    }>;
    updateSettings(body: {
        aiMatchingEnabled?: boolean;
    }, req: any): Promise<{
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
    updateMatch(id: string, body: {
        status: 'active' | 'removed' | 'forced';
    }, req: any): Promise<{
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
    getAuditLogs(page?: string, limit?: string, entity?: string, action?: string, admin_id?: string): Promise<{
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
    createAuditLog(body: {
        action: string;
        entity: string;
        entity_id: string;
        metadata?: any;
    }, req: any): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date;
        action: string;
        entity: string;
        entity_id: string;
        admin_id: string;
    } | undefined>;
    getKyc(status?: string, user_type?: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
                role: {
                    name: string;
                    id: string;
                    description: string | null;
                } | null;
                name: string;
                id: string;
                email: string;
            };
            creator_kyc: {
                id: string;
                updated_at: Date;
                created_at: Date;
                user_id: string;
                engagement_rate: number;
                kyc_request_id: string | null;
                verification_status: string;
                mobile_number: string | null;
                mobile_verified: boolean;
                email_verified: boolean;
                instagram_handle: string | null;
                youtube_handle: string | null;
                tiktok_handle: string | null;
                instagram_profile_url: string | null;
                selfie_url: string | null;
                followers_count: number;
            } | null;
            brand_kyc: {
                id: string;
                updated_at: Date;
                created_at: Date;
                user_id: string;
                company_name: string | null;
                website: string | null;
                kyc_request_id: string | null;
                gst_number: string | null;
                business_email: string | null;
                business_email_verified: boolean;
                linkedin_url: string | null;
                logo_url: string | null;
                business_address: string | null;
                verification_status: string;
            } | null;
        } & {
            id: string;
            status: string;
            user_id: string;
            user_type: string;
            submitted_at: Date;
            reviewed_at: Date | null;
            reviewed_by: string | null;
            remarks: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    approveKyc(id: string, body: {
        remarks?: string;
    }, req: any): Promise<{
        creator_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            engagement_rate: number;
            kyc_request_id: string | null;
            verification_status: string;
            mobile_number: string | null;
            mobile_verified: boolean;
            email_verified: boolean;
            instagram_handle: string | null;
            youtube_handle: string | null;
            tiktok_handle: string | null;
            instagram_profile_url: string | null;
            selfie_url: string | null;
            followers_count: number;
        } | null;
        brand_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            company_name: string | null;
            website: string | null;
            kyc_request_id: string | null;
            gst_number: string | null;
            business_email: string | null;
            business_email_verified: boolean;
            linkedin_url: string | null;
            logo_url: string | null;
            business_address: string | null;
            verification_status: string;
        } | null;
    } & {
        id: string;
        status: string;
        user_id: string;
        user_type: string;
        submitted_at: Date;
        reviewed_at: Date | null;
        reviewed_by: string | null;
        remarks: string | null;
    }>;
    rejectKyc(id: string, body: {
        remarks?: string;
    }, req: any): Promise<{
        creator_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            engagement_rate: number;
            kyc_request_id: string | null;
            verification_status: string;
            mobile_number: string | null;
            mobile_verified: boolean;
            email_verified: boolean;
            instagram_handle: string | null;
            youtube_handle: string | null;
            tiktok_handle: string | null;
            instagram_profile_url: string | null;
            selfie_url: string | null;
            followers_count: number;
        } | null;
        brand_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            company_name: string | null;
            website: string | null;
            kyc_request_id: string | null;
            gst_number: string | null;
            business_email: string | null;
            business_email_verified: boolean;
            linkedin_url: string | null;
            logo_url: string | null;
            business_address: string | null;
            verification_status: string;
        } | null;
    } & {
        id: string;
        status: string;
        user_id: string;
        user_type: string;
        submitted_at: Date;
        reviewed_at: Date | null;
        reviewed_by: string | null;
        remarks: string | null;
    }>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    getNotifications(req: any, page?: string, limit?: string, type?: string, unread?: string): Promise<{
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
    markAllNotificationsRead(req: any): Promise<{
        success: boolean;
    }>;
    markNotificationRead(id: string, req: any): Promise<{
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
    } | null>;
    inviteAdmin(body: {
        email: string;
        role_id: string;
        password?: string;
        name?: string;
    }, req: any): Promise<{
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
    listBrands(search?: string, industry?: string, status?: string, verified?: string, page?: string, limit?: string): Promise<{
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
    getBrand(id: string): Promise<{
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
    createCampaignForBrand(body: Record<string, unknown>, req: any): Promise<{
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
    createCampaignWithBrand(body: Record<string, unknown>, req: any): Promise<{
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
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    })[]>;
    approveWithdrawal(id: string, req: any): Promise<{
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
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
    rejectWithdrawal(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
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
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
}
