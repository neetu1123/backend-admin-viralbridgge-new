"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignPromptModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const campaign_prompt_controller_1 = require("./campaign-prompt.controller");
const campaign_prompt_service_1 = require("./campaign-prompt.service");
let CampaignPromptModule = class CampaignPromptModule {
};
exports.CampaignPromptModule = CampaignPromptModule;
exports.CampaignPromptModule = CampaignPromptModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [campaign_prompt_controller_1.CampaignPromptController],
        providers: [campaign_prompt_service_1.CampaignPromptService],
        exports: [campaign_prompt_service_1.CampaignPromptService],
    })
], CampaignPromptModule);
//# sourceMappingURL=campaign-prompt.module.js.map