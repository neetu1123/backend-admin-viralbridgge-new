import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { VerifyPaymentDto } from './wallet.dto';

export class CreateEscrowPaymentOrderDto {
  @ApiProperty()
  @IsString()
  escrow_id: string;
}

export class VerifyEscrowPaymentDto extends VerifyPaymentDto {}
