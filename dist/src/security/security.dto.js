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
exports.SecurityActivityResponseDto = exports.UserSessionResponseDto = exports.TwoFactorStatusResponseDto = exports.SecuritySettingsResponseDto = exports.SecurityActivityQueryDto = exports.SignOutAllDto = exports.Confirm2FaDto = exports.Enable2FaDto = exports.ChangePasswordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ChangePasswordDto {
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'brand@1234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NewSecurePass1!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'New password must be at least 8 characters' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class Enable2FaDto {
    phoneNumber;
}
exports.Enable2FaDto = Enable2FaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\+?[1-9]\d{7,14}$/, { message: 'Phone number must be a valid E.164 format' }),
    __metadata("design:type", String)
], Enable2FaDto.prototype, "phoneNumber", void 0);
class Confirm2FaDto {
    firebaseMfaCompleted;
}
exports.Confirm2FaDto = Confirm2FaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set true after completing Firebase MFA enrollment on the client' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Confirm2FaDto.prototype, "firebaseMfaCompleted", void 0);
class SignOutAllDto {
    signOutCurrentDevice;
}
exports.SignOutAllDto = SignOutAllDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SignOutAllDto.prototype, "signOutCurrentDevice", void 0);
class SecurityActivityQueryDto {
    page = 1;
    limit = 20;
}
exports.SecurityActivityQueryDto = SecurityActivityQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SecurityActivityQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SecurityActivityQueryDto.prototype, "limit", void 0);
class SecuritySettingsResponseDto {
    twoFactorEnabled;
    twoFactorType;
    phoneNumber;
    lastPasswordChange;
    activeSessionCount;
}
exports.SecuritySettingsResponseDto = SecuritySettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SecuritySettingsResponseDto.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SecuritySettingsResponseDto.prototype, "twoFactorType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SecuritySettingsResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SecuritySettingsResponseDto.prototype, "lastPasswordChange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SecuritySettingsResponseDto.prototype, "activeSessionCount", void 0);
class TwoFactorStatusResponseDto {
    enabled;
    type;
    phoneNumber;
    pendingEnrollment;
}
exports.TwoFactorStatusResponseDto = TwoFactorStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TwoFactorStatusResponseDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], TwoFactorStatusResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], TwoFactorStatusResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TwoFactorStatusResponseDto.prototype, "pendingEnrollment", void 0);
class UserSessionResponseDto {
    id;
    deviceName;
    browser;
    ipAddress;
    location;
    isActive;
    isCurrent;
    lastActive;
    createdAt;
}
exports.UserSessionResponseDto = UserSessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSessionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], UserSessionResponseDto.prototype, "deviceName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], UserSessionResponseDto.prototype, "browser", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], UserSessionResponseDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], UserSessionResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSessionResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSessionResponseDto.prototype, "isCurrent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSessionResponseDto.prototype, "lastActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSessionResponseDto.prototype, "createdAt", void 0);
class SecurityActivityResponseDto {
    id;
    type;
    label;
    device;
    browser;
    ipAddress;
    location;
    createdAt;
}
exports.SecurityActivityResponseDto = SecurityActivityResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SecurityActivityResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SecurityActivityResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SecurityActivityResponseDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SecurityActivityResponseDto.prototype, "device", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SecurityActivityResponseDto.prototype, "browser", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SecurityActivityResponseDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SecurityActivityResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SecurityActivityResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=security.dto.js.map