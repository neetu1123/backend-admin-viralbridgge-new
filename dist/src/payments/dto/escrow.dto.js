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
exports.ResolveDisputeDto = exports.OpenDisputeDto = exports.EscrowRefundDto = exports.EscrowActionDto = exports.EscrowIdDto = exports.CreateEscrowDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateEscrowDto {
    campaign_id;
    creator_id;
    amount;
}
exports.CreateEscrowDto = CreateEscrowDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscrowDto.prototype, "campaign_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscrowDto.prototype, "creator_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEscrowDto.prototype, "amount", void 0);
class EscrowIdDto {
    escrow_id;
}
exports.EscrowIdDto = EscrowIdDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EscrowIdDto.prototype, "escrow_id", void 0);
class EscrowActionDto extends EscrowIdDto {
    notes;
}
exports.EscrowActionDto = EscrowActionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EscrowActionDto.prototype, "notes", void 0);
class EscrowRefundDto extends EscrowActionDto {
}
exports.EscrowRefundDto = EscrowRefundDto;
class OpenDisputeDto {
    campaign_id;
    creator_id;
    reason;
}
exports.OpenDisputeDto = OpenDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpenDisputeDto.prototype, "campaign_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required when brand opens dispute' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpenDisputeDto.prototype, "creator_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpenDisputeDto.prototype, "reason", void 0);
class ResolveDisputeDto {
    notes;
    creator_amount;
    brand_amount;
}
exports.ResolveDisputeDto = ResolveDisputeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveDisputeDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Partial payout to creator' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ResolveDisputeDto.prototype, "creator_amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Partial refund to brand' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ResolveDisputeDto.prototype, "brand_amount", void 0);
//# sourceMappingURL=escrow.dto.js.map