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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteMemberResponseDto = exports.RolePermissionsDto = exports.TeamResponseDto = exports.PendingInvitationResponseDto = exports.TeamMemberResponseDto = exports.ChangeMemberRoleDto = exports.AcceptInvitationDto = exports.InviteMemberDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const organization_constants_1 = require("./organization.constants");
const INVITABLE_BRAND_ROLES = organization_constants_1.BRAND_ORG_ROLES.filter((r) => r !== 'OWNER');
const INVITABLE_CREATOR_ROLES = organization_constants_1.CREATOR_ORG_ROLES.filter((r) => r !== 'OWNER');
const ALL_INVITABLE_ROLES = [...INVITABLE_BRAND_ROLES, ...INVITABLE_CREATOR_ROLES];
class InviteMemberDto {
    email;
    role;
}
exports.InviteMemberDto = InviteMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'member@company.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InviteMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ALL_INVITABLE_ROLES, example: 'CAMPAIGN_MANAGER' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(ALL_INVITABLE_ROLES),
    __metadata("design:type", String)
], InviteMemberDto.prototype, "role", void 0);
class AcceptInvitationDto {
    token;
}
exports.AcceptInvitationDto = AcceptInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invitation token from email or invite link' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AcceptInvitationDto.prototype, "token", void 0);
class ChangeMemberRoleDto {
    role;
}
exports.ChangeMemberRoleDto = ChangeMemberRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ALL_INVITABLE_ROLES, example: 'VIEWER' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(ALL_INVITABLE_ROLES),
    __metadata("design:type", String)
], ChangeMemberRoleDto.prototype, "role", void 0);
class TeamMemberResponseDto {
    id;
    userId;
    name;
    email;
    avatar;
    role;
    roleLabel;
    status;
    lastActiveAt;
    joinedAt;
    isOwner;
}
exports.TeamMemberResponseDto = TeamMemberResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], TeamMemberResponseDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "roleLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], TeamMemberResponseDto.prototype, "lastActiveAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamMemberResponseDto.prototype, "joinedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TeamMemberResponseDto.prototype, "isOwner", void 0);
class PendingInvitationResponseDto {
    id;
    email;
    role;
    roleLabel;
    status;
    invitedBy;
    expiresAt;
    createdAt;
}
exports.PendingInvitationResponseDto = PendingInvitationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "roleLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "invitedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PendingInvitationResponseDto.prototype, "createdAt", void 0);
class TeamResponseDto {
    organizationType;
    organizationId;
    organizationName;
    currentUserRole;
    canManageTeam;
    activeMembers;
    pendingInvitations;
    availableRoles;
}
exports.TeamResponseDto = TeamResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: organization_constants_1.ORGANIZATION_TYPES }),
    __metadata("design:type", String)
], TeamResponseDto.prototype, "organizationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamResponseDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamResponseDto.prototype, "organizationName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TeamResponseDto.prototype, "currentUserRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TeamResponseDto.prototype, "canManageTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TeamMemberResponseDto] }),
    __metadata("design:type", Array)
], TeamResponseDto.prototype, "activeMembers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PendingInvitationResponseDto] }),
    __metadata("design:type", Array)
], TeamResponseDto.prototype, "pendingInvitations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], TeamResponseDto.prototype, "availableRoles", void 0);
class RolePermissionsDto {
    role;
    permissions;
}
exports.RolePermissionsDto = RolePermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RolePermissionsDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], RolePermissionsDto.prototype, "permissions", void 0);
class InviteMemberResponseDto {
    invitation;
    permissionPreview;
}
exports.InviteMemberResponseDto = InviteMemberResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", PendingInvitationResponseDto)
], InviteMemberResponseDto.prototype, "invitation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: RolePermissionsDto }),
    __metadata("design:type", RolePermissionsDto)
], InviteMemberResponseDto.prototype, "permissionPreview", void 0);
//# sourceMappingURL=organization.dto.js.map