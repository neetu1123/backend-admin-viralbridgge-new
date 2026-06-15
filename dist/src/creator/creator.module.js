"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const matching_module_1 = require("../matching/matching.module");
const notifications_module_1 = require("../notifications/notifications.module");
const creator_controller_1 = require("./creator.controller");
const creator_service_1 = require("./creator.service");
let CreatorModule = class CreatorModule {
};
exports.CreatorModule = CreatorModule;
exports.CreatorModule = CreatorModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, matching_module_1.MatchingModule, notifications_module_1.NotificationsModule],
        controllers: [creator_controller_1.CreatorController],
        providers: [creator_service_1.CreatorService],
    })
], CreatorModule);
//# sourceMappingURL=creator.module.js.map