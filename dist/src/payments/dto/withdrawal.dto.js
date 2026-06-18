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
exports.DisputeQueryDto = exports.WithdrawalQueryDto = exports.RejectWithdrawalDto = exports.RequestWithdrawalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
class RequestWithdrawalDto {
    amount;
    notes;
}
exports.RequestWithdrawalDto = RequestWithdrawalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RequestWithdrawalDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestWithdrawalDto.prototype, "notes", void 0);
class RejectWithdrawalDto {
    reason;
}
exports.RejectWithdrawalDto = RejectWithdrawalDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectWithdrawalDto.prototype, "reason", void 0);
class WithdrawalQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    status;
}
exports.WithdrawalQueryDto = WithdrawalQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['PENDING', 'APPROVED', 'REJECTED'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalQueryDto.prototype, "status", void 0);
class DisputeQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    status;
    priority;
    raised_by;
}
exports.DisputeQueryDto = DisputeQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisputeQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisputeQueryDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisputeQueryDto.prototype, "raised_by", void 0);
//# sourceMappingURL=withdrawal.dto.js.map