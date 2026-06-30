import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateEscrowPaymentOrderDto, VerifyEscrowPaymentDto } from './dto/payments.dto';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/wallet.dto';
import { EscrowPaymentService } from './escrow-payment.service';
import { RazorpayService } from './razorpay.service';
import { WalletService } from './wallet.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly walletService: WalletService,
    private readonly razorpayService: RazorpayService,
    private readonly escrowPaymentService: EscrowPaymentService,
  ) {}

  @Post('create-order')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create Razorpay order for wallet top-up' })
  createOrder(@Request() req: { user: { id: string } }, @Body() body: CreatePaymentOrderDto) {
    return this.walletService.createPaymentOrder(req.user.id, body.amount);
  }

  @Post('verify')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Verify Razorpay payment and credit wallet' })
  verify(@Request() req: { user: { id: string } }, @Body() body: VerifyPaymentDto) {
    return this.walletService.verifyAndCredit(req.user.id, body);
  }

  @Post('escrow/create-order')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create Razorpay order to secure escrow payment' })
  createEscrowOrder(@Request() req: { user: { id: string } }, @Body() body: CreateEscrowPaymentOrderDto) {
    return this.escrowPaymentService.createEscrowPaymentOrder(req.user.id, body.escrow_id);
  }

  @Post('escrow/verify')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Verify Razorpay escrow payment and fund escrow' })
  verifyEscrow(@Request() req: { user: { id: string } }, @Body() body: VerifyEscrowPaymentDto) {
    return this.escrowPaymentService.verifyEscrowPayment(req.user.id, body);
  }

  @Get('razorpay-key')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get Razorpay public key' })
  getRazorpayKey() {
    return { keyId: this.razorpayService.getPublicKey() };
  }
}
