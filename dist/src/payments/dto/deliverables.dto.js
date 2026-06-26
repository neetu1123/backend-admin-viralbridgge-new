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
exports.DeliverableRejectDto = exports.DeliverableRevisionDto = exports.SubmitDeliverableDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SubmitDeliverableDto {
    deliverable_id;
    file_url;
    mediaUrl;
    thumbnailUrl;
    notes;
    title;
}
exports.SubmitDeliverableDto = SubmitDeliverableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Deliverable record ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "deliverable_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Deliverable file URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "file_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Legacy alias for file_url' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "title", void 0);
class DeliverableRevisionDto {
    notes;
}
exports.DeliverableRevisionDto = DeliverableRevisionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliverableRevisionDto.prototype, "notes", void 0);
class DeliverableRejectDto {
    notes;
}
exports.DeliverableRejectDto = DeliverableRejectDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliverableRejectDto.prototype, "notes", void 0);
//# sourceMappingURL=deliverables.dto.js.map