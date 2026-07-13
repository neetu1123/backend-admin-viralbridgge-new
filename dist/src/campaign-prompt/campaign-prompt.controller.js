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
exports.CampaignPromptController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const campaign_prompt_dto_1 = require("./campaign-prompt.dto");
const campaign_prompt_service_1 = require("./campaign-prompt.service");
let CampaignPromptController = class CampaignPromptController {
    campaignPrompt;
    constructor(campaignPrompt) {
        this.campaignPrompt = campaignPrompt;
    }
    recordEvent(req, body) {
        return this.campaignPrompt.recordEvent(req.user.id, body.eventType, body.metadata);
    }
    getStatus(req) {
        return this.campaignPrompt.getStatus(req.user.id);
    }
    getAnalytics() {
        return this.campaignPrompt.getAnalytics();
    }
};
exports.CampaignPromptController = CampaignPromptController;
__decorate([
    (0, common_1.Post)('event'),
    (0, roles_decorator_1.Roles)('BRAND'),
    (0, swagger_1.ApiOperation)({ summary: 'Track campaign creation prompt event' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, campaign_prompt_dto_1.CampaignPromptEventDto]),
    __metadata("design:returntype", void 0)
], CampaignPromptController.prototype, "recordEvent", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, roles_decorator_1.Roles)('BRAND'),
    (0, swagger_1.ApiOperation)({ summary: 'Get whether campaign prompt should be shown' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CampaignPromptController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Campaign prompt conversion analytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CampaignPromptController.prototype, "getAnalytics", null);
exports.CampaignPromptController = CampaignPromptController = __decorate([
    (0, swagger_1.ApiTags)('Campaign Prompt'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('campaign-prompt'),
    __metadata("design:paramtypes", [campaign_prompt_service_1.CampaignPromptService])
], CampaignPromptController);
//# sourceMappingURL=campaign-prompt.controller.js.map