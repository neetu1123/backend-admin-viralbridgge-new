"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const wallet_controller_1 = require("./wallet.controller");
const escrow_controller_1 = require("./escrow.controller");
const deliverables_controller_1 = require("./deliverables.controller");
const withdrawal_controller_1 = require("./withdrawal.controller");
const admin_payments_controller_1 = require("./admin-payments.controller");
const razorpay_webhook_controller_1 = require("./razorpay.webhook.controller");
const wallet_service_1 = require("./wallet.service");
const escrow_service_1 = require("./escrow.service");
const deliverables_service_1 = require("./deliverables.service");
const escrow_auto_release_service_1 = require("./escrow-auto-release.service");
const withdrawal_service_1 = require("./withdrawal.service");
const dispute_service_1 = require("./dispute.service");
const razorpay_service_1 = require("./razorpay.service");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            wallet_controller_1.WalletController,
            escrow_controller_1.EscrowController,
            deliverables_controller_1.DeliverablesController,
            withdrawal_controller_1.WithdrawalController,
            admin_payments_controller_1.AdminPaymentsController,
            razorpay_webhook_controller_1.RazorpayWebhookController,
        ],
        providers: [
            wallet_service_1.WalletService,
            escrow_service_1.EscrowService,
            deliverables_service_1.DeliverablesService,
            escrow_auto_release_service_1.EscrowAutoReleaseService,
            withdrawal_service_1.WithdrawalService,
            dispute_service_1.DisputeService,
            razorpay_service_1.RazorpayService,
        ],
        exports: [
            wallet_service_1.WalletService,
            escrow_service_1.EscrowService,
            deliverables_service_1.DeliverablesService,
            withdrawal_service_1.WithdrawalService,
            dispute_service_1.DisputeService,
            razorpay_service_1.RazorpayService,
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map