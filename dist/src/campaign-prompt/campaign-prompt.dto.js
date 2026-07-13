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
exports.CampaignPromptEventDto = exports.CAMPAIGN_PROMPT_EVENTS = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
exports.CAMPAIGN_PROMPT_EVENTS = [
    'DISPLAYED',
    'CLOSED',
    'CREATE_CLICKED',
    'CAMPAIGN_CREATED',
];
class CampaignPromptEventDto {
    eventType;
    metadata;
}
exports.CampaignPromptEventDto = CampaignPromptEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.CAMPAIGN_PROMPT_EVENTS }),
    (0, class_validator_1.IsIn)(exports.CAMPAIGN_PROMPT_EVENTS),
    __metadata("design:type", String)
], CampaignPromptEventDto.prototype, "eventType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CampaignPromptEventDto.prototype, "metadata", void 0);
//# sourceMappingURL=campaign-prompt.dto.js.map