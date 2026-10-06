import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { DiscoverySearchQueryDto } from '../discovery/discovery.dto';
import { REPORT_REASONS } from './listing.constants';

export class CreateListingDto {
  @IsIn(['BUSINESS', 'CREATOR'])
  type!: 'BUSINESS' | 'CREATOR';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  short_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @ValidateIf((_, value) => Boolean(value))
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsObject()
  business_hours?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsObject()
  social_links?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  portfolio?: unknown;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @IsOptional()
  @IsBoolean()
  is_phone_public?: boolean;

  @IsOptional()
  @IsBoolean()
  is_email_public?: boolean;

  @IsOptional()
  @IsBoolean()
  is_whatsapp_public?: boolean;

  @IsOptional()
  @IsBoolean()
  is_address_public?: boolean;

  @IsOptional()
  @IsBoolean()
  is_website_public?: boolean;
}

export class ListingEnquiryDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  website_url?: string;
}

export class ListingReportDto {
  @IsIn([...REPORT_REASONS])
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

export class ListingEventDto {
  @IsString()
  @IsIn(['profile_view', 'search', 'contact_click', 'website_click', 'whatsapp_click', 'enquiry_sent', 'call_click'])
  event_type!: string;

  @IsOptional()
  @IsString()
  listing_type?: string;

  @IsOptional()
  @IsString()
  listing_id?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  query?: string;
}

export class AdminListingUpdateDto {
  @IsOptional()
  @IsIn(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'SUSPENDED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;
}

export class ListingSearchQueryDto extends DiscoverySearchQueryDto {}
