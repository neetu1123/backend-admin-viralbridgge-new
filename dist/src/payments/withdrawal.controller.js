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
exports.WithdrawalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const withdrawal_dto_1 = require("./dto/withdrawal.dto");
const withdrawal_service_1 = require("./withdrawal.service");
let WithdrawalController = class WithdrawalController {
    withdrawalService;
    constructor(withdrawalService) {
        this.withdrawalService = withdrawalService;
    }
    request(req, body) {
        return this.withdrawalService.requestWithdrawal(req.user.id, body);
    }
    list(req, query) {
        return this.withdrawalService.listUserWithdrawals(req.user.id, query);
    }
};
exports.WithdrawalController = WithdrawalController;
__decorate([
    (0, common_1.Post)('request'),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Request a withdrawal from creator wallet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, withdrawal_dto_1.RequestWithdrawalDto]),
    __metadata("design:returntype", void 0)
], WithdrawalController.prototype, "request", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'List own withdrawal requests' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, withdrawal_dto_1.WithdrawalQueryDto]),
    __metadata("design:returntype", void 0)
], WithdrawalController.prototype, "list", null);
exports.WithdrawalController = WithdrawalController = __decorate([
    (0, swagger_1.ApiTags)('Withdrawals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('withdrawals'),
    __metadata("design:paramtypes", [withdrawal_service_1.WithdrawalService])
], WithdrawalController);
//# sourceMappingURL=withdrawal.controller.js.map