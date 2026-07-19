import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

export class PublicCreatorsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsString()
  categories?: string;

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
  @IsString()
  sort?: string;
}

export class PublicCampaignsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categories?: string;

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
  @Min(1)
  deadlineDays?: number;

  @IsOptional()
  @IsString()
  sort?: string;
}
