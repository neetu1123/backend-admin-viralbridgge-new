import { KycService } from './kyc.service';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    getStatus(req: any): Promise<{
        creatorKyc: {
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
        brandKyc: {
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
        latestRequest: ({
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
        }) | null;
        status: string;
    }>;
    submitCreator(req: any, body: Record<string, unknown>): Promise<{
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
        };
    }>;
    submitBrand(req: any, body: Record<string, unknown>): Promise<{
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
            gst_number: string | null;
            business_email: string | null;
            business_email_verified: boolean;
            linkedin_url: string | null;
            logo_url: string | null;
            business_address: string | null;
            verification_status: string;
        };
    }>;
}
