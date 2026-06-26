import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SubmitDeliverableDto {
  @ApiProperty({ description: 'Deliverable record ID' })
  @IsString()
  deliverable_id: string;

  @ApiProperty({ description: 'Deliverable file URL' })
  @IsString()
  file_url: string;

  @ApiPropertyOptional({ description: 'Legacy alias for file_url' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}

export class DeliverableRevisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DeliverableRejectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
