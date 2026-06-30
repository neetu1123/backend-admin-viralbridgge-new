import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { WalletController } from './wallet.controller';
import { PaymentsController } from './payments.controller';
import { EscrowController } from './escrow.controller';
import { DeliverablesController } from './deliverables.controller';
import { WithdrawalController } from './withdrawal.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { RazorpayWebhookController } from './razorpay.webhook.controller';
import { WalletService } from './wallet.service';
import { EscrowService } from './escrow.service';
import { EscrowPaymentService } from './escrow-payment.service';
import { PlatformWalletService } from './platform-wallet.service';
import { DeliverablesService } from './deliverables.service';
import { EscrowAutoReleaseService } from './escrow-auto-release.service';
import { WithdrawalService } from './withdrawal.service';
import { DisputeService } from './dispute.service';
import { RazorpayService } from './razorpay.service';

@Module({
  imports: [StorageModule],
  controllers: [
    WalletController,
    PaymentsController,
    EscrowController,
    DeliverablesController,
    WithdrawalController,
    AdminPaymentsController,
    RazorpayWebhookController,
  ],
  providers: [
    WalletService,
    PlatformWalletService,
    EscrowService,
    EscrowPaymentService,
    DeliverablesService,
    EscrowAutoReleaseService,
    WithdrawalService,
    DisputeService,
    RazorpayService,
  ],
  exports: [
    WalletService,
    PlatformWalletService,
    EscrowService,
    EscrowPaymentService,
    DeliverablesService,
    WithdrawalService,
    DisputeService,
    RazorpayService,
  ],
})
export class PaymentsModule {}
