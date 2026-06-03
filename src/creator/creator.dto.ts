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

export class UpdateCreatorProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  followers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  engagementRate?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  youtube?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;

  @IsOptional()
  @IsString()
  mediaKit?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ApplyCampaignDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedPrice?: number;
}

export class CreatorCampaignQueryDto extends PaginationQueryDto {
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
  budgetMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  followers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  engagementRate?: number;

  @IsOptional()
  @IsIn(['created_desc', 'deadline_asc', 'budget_desc', 'budget_asc'])
  sort?: string;
}

export class ApplicationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
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

export class SubmitDeliverableDto {
  @IsString()
  mediaUrl: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;
}

export class UploadDto {
  @IsString()
  url: string;
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
