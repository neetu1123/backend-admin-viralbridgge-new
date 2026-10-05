import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

export class DiscoverySearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsIn(['all', 'business', 'brand', 'creator'])
  type?: string;

  @IsOptional()
  @IsString()
  verified?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rating?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class DiscoveryEnquiryDto {
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

export class DiscoveryEventDto {
  @IsString()
  @IsIn(['profile_view', 'search', 'contact_click', 'website_click', 'whatsapp_click', 'enquiry_sent'])
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

export class AdminDiscoveryUpdateDto {
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsIn(['ACTIVE', 'HIDDEN', 'PENDING', 'SUSPENDED'])
  discovery_status?: string;

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
}
