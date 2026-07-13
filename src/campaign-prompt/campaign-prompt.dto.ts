import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional } from 'class-validator';

export const CAMPAIGN_PROMPT_EVENTS = [
  'DISPLAYED',
  'CLOSED',
  'CREATE_CLICKED',
  'CAMPAIGN_CREATED',
] as const;

export type CampaignPromptEventType = (typeof CAMPAIGN_PROMPT_EVENTS)[number];

export class CampaignPromptEventDto {
  @ApiProperty({ enum: CAMPAIGN_PROMPT_EVENTS })
  @IsIn(CAMPAIGN_PROMPT_EVENTS)
  eventType: CampaignPromptEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
