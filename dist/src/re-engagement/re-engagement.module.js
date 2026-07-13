"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReEngagementModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const email_module_1 = require("../email/email.module");
const matching_module_1 = require("../matching/matching.module");
const user_activity_module_1 = require("../user-activity/user-activity.module");
const re_engagement_controller_1 = require("./re-engagement.controller");
const re_engagement_service_1 = require("./re-engagement.service");
let ReEngagementModule = class ReEngagementModule {
};
exports.ReEngagementModule = ReEngagementModule;
exports.ReEngagementModule = ReEngagementModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, email_module_1.EmailModule, matching_module_1.MatchingModule, user_activity_module_1.UserActivityModule],
        controllers: [re_engagement_controller_1.ReEngagementController],
        providers: [re_engagement_service_1.ReEngagementService],
        exports: [re_engagement_service_1.ReEngagementService],
    })
], ReEngagementModule);
//# sourceMappingURL=re-engagement.module.js.map