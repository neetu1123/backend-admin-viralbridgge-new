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
exports.EscrowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const escrow_dto_1 = require("./dto/escrow.dto");
const escrow_service_1 = require("./escrow.service");
let EscrowController = class EscrowController {
    escrowService;
    constructor(escrowService) {
        this.escrowService = escrowService;
    }
    create(req, body) {
        return this.escrowService.createEscrow(req.user.id, body);
    }
    get(req, id) {
        return this.escrowService.getEscrow(req.user.id, id);
    }
    release(req, body) {
        return this.escrowService.releaseEscrow(req.user.id, body.escrow_id);
    }
    refund(req, body) {
        return this.escrowService.refundEscrow(req.user.id, body.escrow_id);
    }
    dispute(req, body) {
        const roleName = req.user.role?.name ?? 'CREATOR';
        const role = roleName === 'BRAND' ? 'brand' : 'creator';
        return this.escrowService.openDispute(req.user.id, role, body);
    }
};
exports.EscrowController = EscrowController;
__decorate([
    (0, common_1.Post)('create'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create escrow and lock brand funds' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, escrow_dto_1.CreateEscrowDto]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get escrow by ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('release'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Release escrow to creator wallet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, escrow_dto_1.EscrowActionDto]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "release", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund escrow to brand wallet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, escrow_dto_1.EscrowRefundDto]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "refund", null);
__decorate([
    (0, common_1.Post)('dispute'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Open a dispute on an escrow' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, escrow_dto_1.OpenDisputeDto]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "dispute", null);
exports.EscrowController = EscrowController = __decorate([
    (0, swagger_1.ApiTags)('Escrow'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('escrow'),
    __metadata("design:paramtypes", [escrow_service_1.EscrowService])
], EscrowController);
//# sourceMappingURL=escrow.controller.js.map