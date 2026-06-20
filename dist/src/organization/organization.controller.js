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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const organization_dto_1 = require("./organization.dto");
const organization_service_1 = require("./organization.service");
let OrganizationController = class OrganizationController {
    organizationService;
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    getTeam(req) {
        return this.organizationService.getTeam(req.user.id);
    }
    inviteMember(req, body) {
        return this.organizationService.inviteMember(req.user.id, body);
    }
    getMyInvitations(req) {
        return this.organizationService.getMyInvitations(req.user.id);
    }
    acceptInvitation(req, body) {
        return this.organizationService.acceptInvitation(req.user.id, body);
    }
    changeMemberRole(req, id, body) {
        return this.organizationService.changeMemberRole(req.user.id, id, body);
    }
    removeMember(req, id) {
        return this.organizationService.removeMember(req.user.id, id);
    }
    reinviteMember(req, id) {
        return this.organizationService.reinviteMember(req.user.id, id);
    }
    cancelInvitation(req, id) {
        return this.organizationService.cancelInvitation(req.user.id, id);
    }
    getRolePermissions(type, role) {
        return this.organizationService.getRolePermissions(type, role);
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Get)('team'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get team members and pending invitations' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: organization_dto_1.TeamResponseDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "getTeam", null);
__decorate([
    (0, common_1.Post)('team/invite'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a new team member (owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: organization_dto_1.InviteMemberResponseDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, organization_dto_1.InviteMemberDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Get)('team/invitations/mine'),
    (0, swagger_1.ApiOperation)({ summary: 'List pending invitations for the current user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Post)('team/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a team invitation' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, organization_dto_1.AcceptInvitationDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Patch)('team/member/:id/role'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Change a team member role (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Organization member ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, organization_dto_1.ChangeMemberRoleDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "changeMemberRole", null);
__decorate([
    (0, common_1.Delete)('team/member/:id'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a team member (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Organization member ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)('team/member/:id/reinvite'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Resend a pending invitation (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pending invitation ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "reinviteMember", null);
__decorate([
    (0, common_1.Post)('team/invitation/:id/cancel'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a pending invitation (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Invitation ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "cancelInvitation", null);
__decorate([
    (0, common_1.Get)('team/roles/permissions'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permission preview for a role' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: ['BRAND', 'CREATOR'] }),
    (0, swagger_1.ApiQuery)({ name: 'role', description: 'Organization role key' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: organization_dto_1.RolePermissionsDto }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "getRolePermissions", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, swagger_1.ApiTags)('Organization Team'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('organization'),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map