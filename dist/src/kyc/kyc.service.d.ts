import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class KycService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    getStatus(userId: string): Promise<{
        creatorKyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            engagement_rate: number;
            kyc_request_id: string | null;
            mobile_number: string | null;
            mobile_verified: boolean;
            email_verified: boolean;
            instagram_handle: string | null;
            youtube_handle: string | null;
            tiktok_handle: string | null;
            instagram_profile_url: string | null;
            selfie_url: string | null;
            followers_count: number;
            verification_status: string;
        } | null;
        brandKyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            company_name: string | null;
            website: string | null;
            kyc_request_id: string | null;
            verification_status: string;
            gst_number: string | null;
            business_email: string | null;
            business_email_verified: boolean;
            linkedin_url: string | null;
            logo_url: string | null;
            business_address: string | null;
        } | null;
        latestRequest: ({
            creator_kyc: {
                id: string;
                updated_at: Date;
                created_at: Date;
                user_id: string;
                engagement_rate: number;
                kyc_request_id: string | null;
                mobile_number: string | null;
                mobile_verified: boolean;
                email_verified: boolean;
                instagram_handle: string | null;
                youtube_handle: string | null;
                tiktok_handle: string | null;
                instagram_profile_url: string | null;
                selfie_url: string | null;
                followers_count: number;
                verification_status: string;
            } | null;
            brand_kyc: {
                id: string;
                updated_at: Date;
                created_at: Date;
                user_id: string;
                company_name: string | null;
                website: string | null;
                kyc_request_id: string | null;
                verification_status: string;
                gst_number: string | null;
                business_email: string | null;
                business_email_verified: boolean;
                linkedin_url: string | null;
                logo_url: string | null;
                business_address: string | null;
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
        }) | null;
        status: string;
    }>;
    submitCreator(userId: string, body: Record<string, unknown>): Promise<{
        kycRequest: {
            id: string;
            status: string;
            user_id: string;
            user_type: string;
            submitted_at: Date;
            reviewed_at: Date | null;
            reviewed_by: string | null;
            remarks: string | null;
        };
        creatorKyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            engagement_rate: number;
            kyc_request_id: string | null;
            mobile_number: string | null;
            mobile_verified: boolean;
            email_verified: boolean;
            instagram_handle: string | null;
            youtube_handle: string | null;
            tiktok_handle: string | null;
            instagram_profile_url: string | null;
            selfie_url: string | null;
            followers_count: number;
            verification_status: string;
        };
    }>;
    submitBrand(userId: string, body: Record<string, unknown>): Promise<{
        kycRequest: {
            id: string;
            status: string;
            user_id: string;
            user_type: string;
            submitted_at: Date;
            reviewed_at: Date | null;
            reviewed_by: string | null;
            remarks: string | null;
        };
        brandKyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            company_name: string | null;
            website: string | null;
            kyc_request_id: string | null;
            verification_status: string;
            gst_number: string | null;
            business_email: string | null;
            business_email_verified: boolean;
            linkedin_url: string | null;
            logo_url: string | null;
            business_address: string | null;
        };
    }>;
    listAdmin(query: {
        status?: string;
        user_type?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
                mobile_number: string | null;
                mobile_verified: boolean;
                email_verified: boolean;
                instagram_handle: string | null;
                youtube_handle: string | null;
                tiktok_handle: string | null;
                instagram_profile_url: string | null;
                selfie_url: string | null;
                followers_count: number;
                verification_status: string;
            } | null;
            brand_kyc: {
                id: string;
                updated_at: Date;
                created_at: Date;
                user_id: string;
                company_name: string | null;
                website: string | null;
                kyc_request_id: string | null;
                verification_status: string;
                gst_number: string | null;
                business_email: string | null;
                business_email_verified: boolean;
                linkedin_url: string | null;
                logo_url: string | null;
                business_address: string | null;
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
    approve(requestId: string, adminId: string, remarks?: string): Promise<{
        creator_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            engagement_rate: number;
            kyc_request_id: string | null;
            mobile_number: string | null;
            mobile_verified: boolean;
            email_verified: boolean;
            instagram_handle: string | null;
            youtube_handle: string | null;
            tiktok_handle: string | null;
            instagram_profile_url: string | null;
            selfie_url: string | null;
            followers_count: number;
            verification_status: string;
        } | null;
        brand_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            company_name: string | null;
            website: string | null;
            kyc_request_id: string | null;
            verification_status: string;
            gst_number: string | null;
            business_email: string | null;
            business_email_verified: boolean;
            linkedin_url: string | null;
            logo_url: string | null;
            business_address: string | null;
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
    reject(requestId: string, adminId: string, remarks?: string): Promise<{
        creator_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            engagement_rate: number;
            kyc_request_id: string | null;
            mobile_number: string | null;
            mobile_verified: boolean;
            email_verified: boolean;
            instagram_handle: string | null;
            youtube_handle: string | null;
            tiktok_handle: string | null;
            instagram_profile_url: string | null;
            selfie_url: string | null;
            followers_count: number;
            verification_status: string;
        } | null;
        brand_kyc: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            company_name: string | null;
            website: string | null;
            kyc_request_id: string | null;
            verification_status: string;
            gst_number: string | null;
            business_email: string | null;
            business_email_verified: boolean;
            linkedin_url: string | null;
            logo_url: string | null;
            business_address: string | null;
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
}
