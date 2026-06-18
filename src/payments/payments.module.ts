import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { EscrowController } from './escrow.controller';
import { WithdrawalController } from './withdrawal.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { RazorpayWebhookController } from './razorpay.webhook.controller';
import { WalletService } from './wallet.service';
import { EscrowService } from './escrow.service';
import { WithdrawalService } from './withdrawal.service';
import { DisputeService } from './dispute.service';
import { RazorpayService } from './razorpay.service';

@Module({
  controllers: [
    WalletController,
    EscrowController,
    WithdrawalController,
    AdminPaymentsController,
    RazorpayWebhookController,
  ],
  providers: [
    WalletService,
    EscrowService,
    WithdrawalService,
    DisputeService,
    RazorpayService,
  ],
  exports: [WalletService, EscrowService, WithdrawalService, DisputeService, RazorpayService],
})
export class PaymentsModule {}
