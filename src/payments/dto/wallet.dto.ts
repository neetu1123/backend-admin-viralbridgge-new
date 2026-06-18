import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AddFundsDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Razorpay payment ID after client-side checkout' })
  @IsOptional()
  @IsString()
  razorpay_payment_id?: string;

  @ApiPropertyOptional({ description: 'Razorpay order ID' })
  @IsOptional()
  @IsString()
  razorpay_order_id?: string;

  @ApiPropertyOptional({ description: 'Razorpay signature for verification' })
  @IsOptional()
  @IsString()
  razorpay_signature?: string;
}

export class CreatePaymentOrderDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1)
  amount: number;
}

export class TransactionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  razorpay_order_id: string;

  @ApiProperty()
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty()
  @IsString()
  razorpay_signature: string;
}
