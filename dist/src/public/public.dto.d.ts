import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class PublicCreatorsQueryDto extends PaginationQueryDto {
    niche?: string;
    categories?: string;
    platform?: string;
    locality?: string;
    language?: string;
    followersMin?: number;
    followersMax?: number;
    engagementMin?: number;
    sort?: string;
}
export declare class PublicCampaignsQueryDto extends PaginationQueryDto {
    platform?: string;
    category?: string;
    categories?: string;
    locality?: string;
    language?: string;
    budgetMin?: number;
    budgetMax?: number;
    deadlineDays?: number;
    sort?: string;
}
