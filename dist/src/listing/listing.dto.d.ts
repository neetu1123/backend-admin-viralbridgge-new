import { DiscoverySearchQueryDto } from '../discovery/discovery.dto';
export declare class CreateListingDto {
    type: 'BUSINESS' | 'CREATOR';
    name?: string;
}
export declare class UpdateListingDto {
    name?: string;
    slug?: string;
    logo_url?: string;
    cover_image_url?: string;
    short_description?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    website?: string;
    city?: string;
    state?: string;
    area?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    business_hours?: Record<string, unknown>;
    languages?: string[];
    services?: string[];
    social_links?: Record<string, string>;
    gallery?: string[];
    portfolio?: unknown;
    is_visible?: boolean;
    is_phone_public?: boolean;
    is_email_public?: boolean;
    is_whatsapp_public?: boolean;
    is_address_public?: boolean;
    is_website_public?: boolean;
}
export declare class ListingEnquiryDto {
    name: string;
    email: string;
    phone?: string;
    message: string;
    website_url?: string;
}
export declare class ListingReportDto {
    reason: string;
    details?: string;
}
export declare class ListingEventDto {
    event_type: string;
    listing_type?: string;
    listing_id?: string;
    category?: string;
    city?: string;
    query?: string;
}
export declare class AdminListingUpdateDto {
    status?: string;
    verified?: boolean;
    is_featured?: boolean;
    is_visible?: boolean;
    rejection_reason?: string;
}
export declare class ListingSearchQueryDto extends DiscoverySearchQueryDto {
}
