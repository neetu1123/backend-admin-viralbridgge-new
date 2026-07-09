import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class UpdateBrandProfileDto {
    companyName?: string;
    website?: string;
    industry?: string;
    description?: string;
    logo?: string;
    contactEmail?: string;
    phone?: string;
    location?: string;
}
export declare class CampaignDto {
    title: string;
    description: string;
    platform: string;
    budget: number;
    deadline: string;
    deliverables?: string[];
    locality?: string;
    languages?: string[];
    status?: string;
}
export declare class BrandCampaignQueryDto extends PaginationQueryDto {
    platform?: string;
    status?: string;
    locality?: string;
    language?: string;
    sort?: string;
}
export declare class TransactionQueryDto extends PaginationQueryDto {
    type?: string;
    status?: string;
}
export declare class NotificationQueryDto extends PaginationQueryDto {
    isRead?: boolean;
}
export declare class CreatorDiscoveryQueryDto extends PaginationQueryDto {
    niche?: string;
    platform?: string;
    locality?: string;
    language?: string;
    followersMin?: number;
    followersMax?: number;
    engagementMin?: number;
    sort?: string;
}
export declare class RevisionDto {
    notes?: string;
}
export declare class FundsDto {
    amount: number;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
}
export declare class CreatePaymentOrderDto {
    amount: number;
}
export declare class VerifyPaymentDto {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
export declare class SendMessageDto {
    conversationId: string;
    message: string;
    type?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
}
export declare class UpdateSettingsDto {
    [key: string]: any;
}
