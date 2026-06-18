import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AddFundsDto, CreatePaymentOrderDto, TransactionQueryDto, VerifyPaymentDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';
import { RazorpayService } from './razorpay.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly razorpayService: RazorpayService,
  ) {}

  @Get()
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get current user wallet balance' })
  getWallet(@Request() req: { user: { id: string } }) {
    return this.walletService.getWallet(req.user.id);
  }

  @Get('transactions')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List wallet transactions' })
  getTransactions(@Request() req: { user: { id: string } }, @Query() query: TransactionQueryDto) {
    return this.walletService.getTransactions(req.user.id, query);
  }

  @Post('add-funds')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Add funds to wallet (Razorpay or dev mock)' })
  addFunds(@Request() req: { user: { id: string } }, @Body() body: AddFundsDto) {
    return this.walletService.addFunds(req.user.id, body);
  }

  @Post('create-order')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create Razorpay order for wallet top-up' })
  createOrder(@Request() req: { user: { id: string } }, @Body() body: CreatePaymentOrderDto) {
    return this.razorpayService.createOrder(req.user.id, body.amount);
  }

  @Post('verify-payment')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Verify Razorpay payment and credit wallet' })
  verifyPayment(@Request() req: { user: { id: string } }, @Body() body: VerifyPaymentDto) {
    return this.walletService.verifyAndCredit(req.user.id, body);
  }

  @Get('razorpay-key')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get Razorpay public key' })
  getRazorpayKey() {
    return { keyId: this.razorpayService.getPublicKey() };
  }
}
