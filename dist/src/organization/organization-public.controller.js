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
exports.OrganizationPublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organization_dto_1 = require("./organization.dto");
const organization_service_1 = require("./organization.service");
let OrganizationPublicController = class OrganizationPublicController {
    organizationService;
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    getInvitationByToken(token) {
        return this.organizationService.getInvitationByToken(token);
    }
};
exports.OrganizationPublicController = OrganizationPublicController;
__decorate([
    (0, common_1.Get)('team/invitation/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invitation details by token (public, no auth required)' }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'Invitation token from email link' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: organization_dto_1.InvitationPreviewDto }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationPublicController.prototype, "getInvitationByToken", null);
exports.OrganizationPublicController = OrganizationPublicController = __decorate([
    (0, swagger_1.ApiTags)('Organization Team'),
    (0, common_1.Controller)('organization'),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationPublicController);
//# sourceMappingURL=organization-public.controller.js.map