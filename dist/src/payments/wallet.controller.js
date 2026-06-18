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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const wallet_dto_1 = require("./dto/wallet.dto");
const wallet_service_1 = require("./wallet.service");
const razorpay_service_1 = require("./razorpay.service");
let WalletController = class WalletController {
    walletService;
    razorpayService;
    constructor(walletService, razorpayService) {
        this.walletService = walletService;
        this.razorpayService = razorpayService;
    }
    getWallet(req) {
        return this.walletService.getWallet(req.user.id);
    }
    getTransactions(req, query) {
        return this.walletService.getTransactions(req.user.id, query);
    }
    addFunds(req, body) {
        return this.walletService.addFunds(req.user.id, body);
    }
    createOrder(req, body) {
        return this.razorpayService.createOrder(req.user.id, body.amount);
    }
    verifyPayment(req, body) {
        return this.walletService.verifyAndCredit(req.user.id, body);
    }
    getRazorpayKey() {
        return { keyId: this.razorpayService.getPublicKey() };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user wallet balance' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'List wallet transactions' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.TransactionQueryDto]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('add-funds'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Add funds to wallet (Razorpay or dev mock)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.AddFundsDto]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "addFunds", null);
__decorate([
    (0, common_1.Post)('create-order'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Razorpay order for wallet top-up' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.CreatePaymentOrderDto]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('verify-payment'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay payment and credit wallet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('razorpay-key'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Razorpay public key' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getRazorpayKey", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        razorpay_service_1.RazorpayService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map