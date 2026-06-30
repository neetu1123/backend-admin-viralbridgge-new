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
exports.AdminPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const escrow_dto_1 = require("./dto/escrow.dto");
const withdrawal_dto_1 = require("./dto/withdrawal.dto");
const dispute_service_1 = require("./dispute.service");
const escrow_service_1 = require("./escrow.service");
const withdrawal_service_1 = require("./withdrawal.service");
let AdminPaymentsController = class AdminPaymentsController {
    withdrawalService;
    disputeService;
    escrowService;
    constructor(withdrawalService, disputeService, escrowService) {
        this.withdrawalService = withdrawalService;
        this.disputeService = disputeService;
        this.escrowService = escrowService;
    }
    getWithdrawals(status) {
        return this.withdrawalService.listAdminWithdrawals(status ?? 'PENDING');
    }
    approveWithdrawal(id, req) {
        return this.withdrawalService.approveWithdrawal(id, req.user.id);
    }
    approveWithdrawalPatch(id, req) {
        return this.withdrawalService.approveWithdrawal(id, req.user.id);
    }
    rejectWithdrawal(id, body, req) {
        return this.withdrawalService.rejectWithdrawal(id, req.user.id, body.reason);
    }
    rejectWithdrawalPatch(id, body, req) {
        return this.withdrawalService.rejectWithdrawal(id, req.user.id, body.reason);
    }
    getDisputeStats() {
        return this.disputeService.getAdminDisputeStats();
    }
    getEscrows(status) {
        return this.escrowService.listAdminEscrows(status);
    }
    getDisputes(query) {
        return this.disputeService.listAdminDisputes(query);
    }
    getDispute(id) {
        return this.disputeService.getAdminDispute(id);
    }
    resolveDispute(id, body, req) {
        return this.disputeService.resolveDispute(id, req.user.id, body);
    }
    resolveDisputePatch(id, body, req) {
        return this.disputeService.resolveDispute(id, req.user.id, body);
    }
    refundDispute(id, body, req) {
        return this.disputeService.refundDispute(id, req.user.id, body.notes);
    }
    refundDisputePatch(id, body, req) {
        return this.disputeService.refundDispute(id, req.user.id, body.notes);
    }
    escalateDispute(id, req) {
        return this.disputeService.escalateDispute(id, req.user.id);
    }
    partialPayout(id, body, req) {
        return this.disputeService.resolveDispute(id, req.user.id, body);
    }
    adminReleaseEscrow(id) {
        return this.escrowService.adminReleaseEscrow(id);
    }
    adminRefundEscrow(id) {
        return this.escrowService.adminRefundEscrow(id);
    }
};
exports.AdminPaymentsController = AdminPaymentsController;
__decorate([
    (0, common_1.Get)('withdrawals'),
    (0, swagger_1.ApiOperation)({ summary: 'List withdrawal requests for admin review' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "getWithdrawals", null);
__decorate([
    (0, common_1.Post)('withdrawals/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a withdrawal request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "approveWithdrawal", null);
__decorate([
    (0, common_1.Patch)('withdrawals/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "approveWithdrawalPatch", null);
__decorate([
    (0, common_1.Post)('withdrawals/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a withdrawal request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, withdrawal_dto_1.RejectWithdrawalDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "rejectWithdrawal", null);
__decorate([
    (0, common_1.Patch)('withdrawals/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, withdrawal_dto_1.RejectWithdrawalDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "rejectWithdrawalPatch", null);
__decorate([
    (0, common_1.Get)('disputes/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Dispute dashboard stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "getDisputeStats", null);
__decorate([
    (0, common_1.Get)('escrows'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitor all escrows (admin)' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "getEscrows", null);
__decorate([
    (0, common_1.Get)('disputes'),
    (0, swagger_1.ApiOperation)({ summary: 'List all disputes' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdrawal_dto_1.DisputeQueryDto]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "getDisputes", null);
__decorate([
    (0, common_1.Get)('disputes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dispute by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "getDispute", null);
__decorate([
    (0, common_1.Post)('disputes/:id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve dispute — release full or partial amount to creator' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, escrow_dto_1.ResolveDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "resolveDispute", null);
__decorate([
    (0, common_1.Patch)('disputes/:id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, escrow_dto_1.ResolveDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "resolveDisputePatch", null);
__decorate([
    (0, common_1.Post)('disputes/:id/refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund dispute — return funds to brand' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, escrow_dto_1.ResolveDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "refundDispute", null);
__decorate([
    (0, common_1.Patch)('disputes/:id/refund'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, escrow_dto_1.ResolveDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "refundDisputePatch", null);
__decorate([
    (0, common_1.Patch)('disputes/:id/escalate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "escalateDispute", null);
__decorate([
    (0, common_1.Patch)('disputes/:id/partial-payout'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, escrow_dto_1.ResolveDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "partialPayout", null);
__decorate([
    (0, common_1.Post)('escrows/:id/release'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin release escrow to creator' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "adminReleaseEscrow", null);
__decorate([
    (0, common_1.Post)('escrows/:id/refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin refund escrow to brand' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "adminRefundEscrow", null);
exports.AdminPaymentsController = AdminPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [withdrawal_service_1.WithdrawalService,
        dispute_service_1.DisputeService,
        escrow_service_1.EscrowService])
], AdminPaymentsController);
//# sourceMappingURL=admin-payments.controller.js.map