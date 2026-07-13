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
exports.AdminUserAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const admin_user_analytics_dto_1 = require("../analytics/admin-user-analytics.dto");
const admin_user_analytics_service_1 = require("../analytics/admin-user-analytics.service");
let AdminUserAnalyticsController = class AdminUserAnalyticsController {
    adminUserAnalytics;
    constructor(adminUserAnalytics) {
        this.adminUserAnalytics = adminUserAnalytics;
    }
    listUsers(query) {
        return this.adminUserAnalytics.listUsers(query);
    }
    getUser(userId) {
        return this.adminUserAnalytics.getUserDetail(userId);
    }
    getWallet(userId, query) {
        return this.adminUserAnalytics.getUserWallet(userId, query);
    }
    getActivity(userId, query) {
        return this.adminUserAnalytics.getUserActivity(userId, query);
    }
    getCampaigns(userId, query) {
        return this.adminUserAnalytics.getUserCampaigns(userId, query);
    }
};
exports.AdminUserAnalyticsController = AdminUserAnalyticsController;
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'List users with analytics summary' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminUserAnalyticsController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'User analytics detail' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminUserAnalyticsController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('users/:userId/wallet'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'User wallet analytics' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminUserAnalyticsController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('users/:userId/activity'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'User activity analytics' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminUserAnalyticsController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Get)('users/:userId/campaigns'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'User campaign analytics' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminUserAnalyticsController.prototype, "getCampaigns", null);
exports.AdminUserAnalyticsController = AdminUserAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Admin User Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('admin/analytics'),
    __metadata("design:paramtypes", [admin_user_analytics_service_1.AdminUserAnalyticsService])
], AdminUserAnalyticsController);
//# sourceMappingURL=admin-user-analytics.controller.js.map