import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class UpdateCreatorProfileDto {
    fullName?: string;
    bio?: string;
    niche?: string;
    followers?: number;
    engagementRate?: number;
    languages?: string[];
    locality?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    mediaKit?: string;
    portfolio?: string;
    contactEmail?: string;
    phone?: string;
}
export declare class ApplyCampaignDto {
    message?: string;
    proposedPrice?: number;
}
export declare class CreatorCampaignQueryDto extends PaginationQueryDto {
    platform?: string;
    locality?: string;
    language?: string;
    budgetMin?: number;
    budgetMax?: number;
    followers?: number;
    engagementRate?: number;
    sort?: string;
}
export declare class ApplicationQueryDto extends PaginationQueryDto {
    status?: string;
}
export declare class TransactionQueryDto extends PaginationQueryDto {
    type?: string;
    status?: string;
}
export declare class NotificationQueryDto extends PaginationQueryDto {
    isRead?: boolean;
}
export declare class SubmitDeliverableDto {
    mediaUrl: string;
    thumbnailUrl?: string;
    notes?: string;
}
export declare class WithdrawDto {
    amount: number;
}
export declare class UploadDto {
    url: string;
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
