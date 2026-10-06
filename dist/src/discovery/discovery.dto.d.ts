import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class DiscoverySearchQueryDto extends PaginationQueryDto {
    q?: string;
    category?: string;
    subcategory?: string;
    city?: string;
    area?: string;
    type?: string;
    verified?: string;
    rating?: number;
    sort?: string;
    status?: string;
}
export declare class DiscoveryEnquiryDto {
    name: string;
    email: string;
    phone?: string;
    message: string;
    website_url?: string;
}
export declare class DiscoveryEventDto {
    event_type: string;
    listing_type?: string;
    listing_id?: string;
    category?: string;
    city?: string;
    query?: string;
}
export declare class AdminDiscoveryUpdateDto {
    featured?: boolean;
    verified?: boolean;
    discovery_status?: string;
    is_phone_public?: boolean;
    is_email_public?: boolean;
    is_whatsapp_public?: boolean;
    is_address_public?: boolean;
}
