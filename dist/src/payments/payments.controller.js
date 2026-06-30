"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const payments_dto_1 = require("./dto/payments.dto");
const wallet_dto_1 = require("./dto/wallet.dto");
const escrow_payment_service_1 = require("./escrow-payment.service");
const razorpay_service_1 = require("./razorpay.service");
const wallet_service_1 = require("./wallet.service");
let PaymentsController = class PaymentsController {
    walletService;
    razorpayService;
    escrowPaymentService;
    constructor(walletService, razorpayService, escrowPaymentService) {
        this.walletService = walletService;
        this.razorpayService = razorpayService;
        this.escrowPaymentService = escrowPaymentService;
    }
    createOrder(req, body) {
        return this.walletService.createPaymentOrder(req.user.id, body.amount);
    }
    verify(req, body) {
        return this.walletService.verifyAndCredit(req.user.id, body);
    }
    createEscrowOrder(req, body) {
        return this.escrowPaymentService.createEscrowPaymentOrder(req.user.id, body.escrow_id);
    }
    verifyEscrow(req, body) {
        return this.escrowPaymentService.verifyEscrowPayment(req.user.id, body);
    }
    getRazorpayKey() {
        return { keyId: this.razorpayService.getPublicKey() };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-order'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Razorpay order for wallet top-up' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.CreatePaymentOrderDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay payment and credit wallet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('escrow/create-order'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Razorpay order to secure escrow payment' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payments_dto_1.CreateEscrowPaymentOrderDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createEscrowOrder", null);
__decorate([
    (0, common_1.Post)('escrow/verify'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay escrow payment and fund escrow' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payments_dto_1.VerifyEscrowPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verifyEscrow", null);
__decorate([
    (0, common_1.Get)('razorpay-key'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Razorpay public key' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getRazorpayKey", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        razorpay_service_1.RazorpayService,
        escrow_payment_service_1.EscrowPaymentService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map