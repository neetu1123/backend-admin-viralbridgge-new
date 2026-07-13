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
exports.ReEngagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const re_engagement_service_1 = require("./re-engagement.service");
let ReEngagementController = class ReEngagementController {
    reEngagement;
    constructor(reEngagement) {
        this.reEngagement = reEngagement;
    }
    getAnalytics() {
        return this.reEngagement.getAnalytics();
    }
    runJob() {
        return this.reEngagement.processInactiveUsers();
    }
};
exports.ReEngagementController = ReEngagementController;
__decorate([
    (0, common_1.Get)('analytics'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Re-engagement email analytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReEngagementController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Post)('run'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger re-engagement job' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReEngagementController.prototype, "runJob", null);
exports.ReEngagementController = ReEngagementController = __decorate([
    (0, swagger_1.ApiTags)('Re-engagement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('admin/re-engagement'),
    __metadata("design:paramtypes", [re_engagement_service_1.ReEngagementService])
], ReEngagementController);
//# sourceMappingURL=re-engagement.controller.js.map