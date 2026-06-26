import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { EscrowController } from './escrow.controller';
import { DeliverablesController } from './deliverables.controller';
import { WithdrawalController } from './withdrawal.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { RazorpayWebhookController } from './razorpay.webhook.controller';
import { WalletService } from './wallet.service';
import { EscrowService } from './escrow.service';
import { DeliverablesService } from './deliverables.service';
import { EscrowAutoReleaseService } from './escrow-auto-release.service';
import { WithdrawalService } from './withdrawal.service';
import { DisputeService } from './dispute.service';
import { RazorpayService } from './razorpay.service';

@Module({
  controllers: [
    WalletController,
    EscrowController,
    DeliverablesController,
    WithdrawalController,
    AdminPaymentsController,
    RazorpayWebhookController,
  ],
  providers: [
    WalletService,
    EscrowService,
    DeliverablesService,
    EscrowAutoReleaseService,
    WithdrawalService,
    DisputeService,
    RazorpayService,
  ],
  exports: [
    WalletService,
    EscrowService,
    DeliverablesService,
    WithdrawalService,
    DisputeService,
    RazorpayService,
  ],
})
export class PaymentsModule {}
