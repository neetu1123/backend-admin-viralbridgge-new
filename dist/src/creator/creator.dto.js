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
exports.UpdateSettingsDto = exports.SendMessageDto = exports.UploadDto = exports.WithdrawDto = exports.SubmitDeliverableDto = exports.NotificationQueryDto = exports.TransactionQueryDto = exports.ApplicationQueryDto = exports.CreatorCampaignQueryDto = exports.ApplyCampaignDto = exports.UpdateCreatorProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
class UpdateCreatorProfileDto {
    fullName;
    bio;
    niche;
    followers;
    engagementRate;
    languages;
    locality;
    instagram;
    youtube;
    tiktok;
    mediaKit;
    portfolio;
    contactEmail;
    phone;
}
exports.UpdateCreatorProfileDto = UpdateCreatorProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "niche", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCreatorProfileDto.prototype, "followers", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCreatorProfileDto.prototype, "engagementRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCreatorProfileDto.prototype, "languages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "locality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "instagram", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "youtube", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "tiktok", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "mediaKit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "portfolio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCreatorProfileDto.prototype, "phone", void 0);
class ApplyCampaignDto {
    message;
    proposedPrice;
}
exports.ApplyCampaignDto = ApplyCampaignDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyCampaignDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ApplyCampaignDto.prototype, "proposedPrice", void 0);
class CreatorCampaignQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    platform;
    locality;
    language;
    budgetMin;
    budgetMax;
    followers;
    engagementRate;
    sort;
    includeMatch;
}
exports.CreatorCampaignQueryDto = CreatorCampaignQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatorCampaignQueryDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatorCampaignQueryDto.prototype, "locality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatorCampaignQueryDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatorCampaignQueryDto.prototype, "budgetMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatorCampaignQueryDto.prototype, "budgetMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatorCampaignQueryDto.prototype, "followers", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatorCampaignQueryDto.prototype, "engagementRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['created_desc', 'deadline_asc', 'budget_desc', 'budget_asc']),
    __metadata("design:type", String)
], CreatorCampaignQueryDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatorCampaignQueryDto.prototype, "includeMatch", void 0);
class ApplicationQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    status;
}
exports.ApplicationQueryDto = ApplicationQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "status", void 0);
class TransactionQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    type;
    status;
}
exports.TransactionQueryDto = TransactionQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "status", void 0);
class NotificationQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    isRead;
}
exports.NotificationQueryDto = NotificationQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], NotificationQueryDto.prototype, "isRead", void 0);
class SubmitDeliverableDto {
    mediaUrl;
    thumbnailUrl;
    notes;
}
exports.SubmitDeliverableDto = SubmitDeliverableDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "notes", void 0);
class WithdrawDto {
    amount;
    otp;
}
exports.WithdrawDto = WithdrawDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WithdrawDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "otp", void 0);
class UploadDto {
    url;
}
exports.UploadDto = UploadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDto.prototype, "url", void 0);
class SendMessageDto {
    conversationId;
    message;
    type;
    fileUrl;
    fileName;
    fileSize;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "fileUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "fileSize", void 0);
class UpdateSettingsDto {
}
exports.UpdateSettingsDto = UpdateSettingsDto;
//# sourceMappingURL=creator.dto.js.map