import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

export class UpdateBrandProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class CampaignDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  platform: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsString()
  deadline: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  deliverables?: string[];

  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}

export class BrandCampaignQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsIn(['created_desc', 'deadline_asc', 'budget_desc', 'budget_asc'])
  sort?: string;
}

export class TransactionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class NotificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  isRead?: boolean;
}

export class CreatorDiscoveryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  followersMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  followersMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  engagementMin?: number;

  @IsOptional()
  @IsIn(['rating', 'followers', 'engagement'])
  sort?: string;
}

export class RevisionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class FundsDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  razorpay_order_id?: string;

  @IsOptional()
  @IsString()
  razorpay_payment_id?: string;

  @IsOptional()
  @IsString()
  razorpay_signature?: string;
}

export class CreatePaymentOrderDto {
  @IsNumber()
  @Min(1)
  amount: number;
}

export class VerifyPaymentDto {
  @IsString()
  razorpay_order_id: string;

  @IsString()
  razorpay_payment_id: string;

  @IsString()
  razorpay_signature: string;
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileSize?: string;
}

export class UpdateSettingsDto {
  [key: string]: any;
}
