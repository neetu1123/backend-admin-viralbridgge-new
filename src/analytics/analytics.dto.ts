import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ANALYTICS_PERIODS } from './analytics.constants';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ANALYTICS_PERIODS, default: '30d' })
  @IsOptional()
  @IsString()
  @IsIn([...ANALYTICS_PERIODS])
  period?: string;

  @ApiPropertyOptional({ description: 'Custom range start (ISO date)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Custom range end (ISO date)' })
  @IsOptional()
  @IsString()
  to?: string;
}
