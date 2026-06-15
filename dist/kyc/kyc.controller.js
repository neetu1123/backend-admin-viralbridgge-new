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
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const kyc_service_1 = require("./kyc.service");
let KycController = class KycController {
    kycService;
    constructor(kycService) {
        this.kycService = kycService;
    }
    getStatus(req) {
        return this.kycService.getStatus(req.user.id);
    }
    submitCreator(req, body) {
        const role = (req.user.role?.name ?? '').toUpperCase();
        if (role !== 'CREATOR')
            throw new common_1.ForbiddenException('Only creators can submit creator KYC');
        return this.kycService.submitCreator(req.user.id, body);
    }
    submitBrand(req, body) {
        const role = (req.user.role?.name ?? '').toUpperCase();
        if (role !== 'BRAND')
            throw new common_1.ForbiddenException('Only brands can submit brand KYC');
        return this.kycService.submitBrand(req.user.id, body);
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('creator/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "submitCreator", null);
__decorate([
    (0, common_1.Post)('brand/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "submitBrand", null);
exports.KycController = KycController = __decorate([
    (0, swagger_1.ApiTags)('KYC'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('kyc'),
    __metadata("design:paramtypes", [kyc_service_1.KycService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map