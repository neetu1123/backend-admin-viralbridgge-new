import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEscrowDto {
  @ApiProperty()
  @IsString()
  campaign_id: string;

  @ApiProperty()
  @IsString()
  creator_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

export class EscrowIdDto {
  @ApiProperty()
  @IsString()
  escrow_id: string;
}

export class EscrowActionDto extends EscrowIdDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class EscrowRefundDto extends EscrowActionDto {}

export class OpenDisputeDto {
  @ApiProperty()
  @IsString()
  campaign_id: string;

  @ApiPropertyOptional({ description: 'Required when brand opens dispute' })
  @IsOptional()
  @IsString()
  creator_id?: string;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class ResolveDisputeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Partial payout to creator' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creator_amount?: number;

  @ApiPropertyOptional({ description: 'Partial refund to brand' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  brand_amount?: number;
}
