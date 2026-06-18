import type { PrismaClient } from '@prisma/client';
declare const PLATFORMS: readonly ["INSTAGRAM", "YOUTUBE", "TIKTOK", "FACEBOOK", "LINKEDIN"];
declare const CAMPAIGN_STATUSES: readonly ["DRAFT", "ACTIVE", "PENDING_APPROVAL"];
export type AdminCampaignBody = Record<string, unknown>;
export declare function listAdminBrands(prisma: PrismaClient, query?: {
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
export declare function getAdminBrandDetail(prisma: PrismaClient, brandId: string): Promise<{
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
} | null>;
export declare function createCampaignForBrand(prisma: PrismaClient, adminId: string, body: AdminCampaignBody, auditFn: (data: {
    adminId: string;
    brandId: string;
    campaignId: string;
    metadata?: unknown;
}) => Promise<void>): Promise<{
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
export declare function createBrandAccount(prisma: PrismaClient, body: AdminCampaignBody): Promise<{
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
    brandProfile: {
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
    tempPassword: string;
    invitationNote: string;
}>;
export declare function createCampaignWithBrand(prisma: PrismaClient, adminId: string, body: AdminCampaignBody, auditFn: (data: {
    adminId: string;
    brandId: string;
    campaignId: string;
    metadata?: unknown;
}) => Promise<void>): Promise<{
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
export { PLATFORMS, CAMPAIGN_STATUSES };
