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
exports.AnalyticsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const analytics_constants_1 = require("./analytics.constants");
class AnalyticsQueryDto {
    period;
    from;
    to;
}
exports.AnalyticsQueryDto = AnalyticsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: analytics_constants_1.ANALYTICS_PERIODS, default: '30d' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)([...analytics_constants_1.ANALYTICS_PERIODS]),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom range start (ISO date)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom range end (ISO date)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "to", void 0);
//# sourceMappingURL=analytics.dto.js.map