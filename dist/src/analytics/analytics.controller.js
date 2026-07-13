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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const admin_user_analytics_dto_1 = require("./admin-user-analytics.dto");
const admin_user_analytics_service_1 = require("./admin-user-analytics.service");
const admin_analytics_service_1 = require("./admin-analytics.service");
const analytics_dto_1 = require("./analytics.dto");
const creator_analytics_service_1 = require("./creator-analytics.service");
let AnalyticsController = class AnalyticsController {
    creatorAnalytics;
    adminAnalytics;
    adminUserAnalytics;
    constructor(creatorAnalytics, adminAnalytics, adminUserAnalytics) {
        this.creatorAnalytics = creatorAnalytics;
        this.adminAnalytics = adminAnalytics;
        this.adminUserAnalytics = adminUserAnalytics;
    }
    creatorDashboard(req, query) {
        return this.creatorAnalytics.getDashboard(req.user.id, query);
    }
    creatorEarnings(req, query) {
        return this.creatorAnalytics.getEarnings(req.user.id, query);
    }
    creatorProfilePerformance(req, query) {
        return this.creatorAnalytics.getProfilePerformance(req.user.id, query);
    }
    creatorTopBrands(req, query) {
        return this.creatorAnalytics.getTopBrands(req.user.id, query);
    }
    adminDashboard(req, query) {
        return this.adminAnalytics.getDashboard(req.user.id, query);
    }
    adminUsers(req, query) {
        return this.adminAnalytics.getUsers(req.user.id, query);
    }
    adminRevenue(req, query) {
        return this.adminAnalytics.getRevenue(req.user.id, query);
    }
    adminCampaigns(req, query) {
        return this.adminAnalytics.getCampaigns(req.user.id, query);
    }
    adminKyc(req, query) {
        return this.adminAnalytics.getKyc(req.user.id, query);
    }
    adminPlatforms(req, query) {
        return this.adminAnalytics.getPlatforms(req.user.id, query);
    }
    adminUserList(query) {
        return this.adminUserAnalytics.listUsers(query);
    }
    adminUserDetail(userId) {
        return this.adminUserAnalytics.getUserDetail(userId);
    }
    adminUserWallet(userId, query) {
        return this.adminUserAnalytics.getUserWallet(userId, query);
    }
    adminUserActivity(userId, query) {
        return this.adminUserAnalytics.getUserActivity(userId, query);
    }
    adminUserCampaigns(userId, query) {
        return this.adminUserAnalytics.getUserCampaigns(userId, query);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('creator/dashboard'),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Creator analytics dashboard KPIs' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "creatorDashboard", null);
__decorate([
    (0, common_1.Get)('creator/earnings'),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Creator earnings trends and funnel' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "creatorEarnings", null);
__decorate([
    (0, common_1.Get)('creator/profile-performance'),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Creator profile performance metrics' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "creatorProfilePerformance", null);
__decorate([
    (0, common_1.Get)('creator/top-brands'),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Top brands worked with' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "creatorTopBrands", null);
__decorate([
    (0, common_1.Get)('admin/dashboard'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin analytics dashboard KPIs' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminDashboard", null);
__decorate([
    (0, common_1.Get)('admin/users'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'User growth analytics' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminUsers", null);
__decorate([
    (0, common_1.Get)('admin/revenue'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform revenue growth' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminRevenue", null);
__decorate([
    (0, common_1.Get)('admin/campaigns'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Campaign analytics and growth' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminCampaigns", null);
__decorate([
    (0, common_1.Get)('admin/kyc'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'KYC pipeline analytics' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminKyc", null);
__decorate([
    (0, common_1.Get)('admin/platforms'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform distribution and top categories' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminPlatforms", null);
__decorate([
    (0, common_1.Get)('admin/user-list'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated user list for admin analytics' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminUserList", null);
__decorate([
    (0, common_1.Get)('admin/user-analytics/:userId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Detailed analytics for a single user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminUserDetail", null);
__decorate([
    (0, common_1.Get)('admin/user-analytics/:userId/wallet'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Wallet analytics for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminUserWallet", null);
__decorate([
    (0, common_1.Get)('admin/user-analytics/:userId/activity'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Activity analytics for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminUserActivity", null);
__decorate([
    (0, common_1.Get)('admin/user-analytics/:userId/campaigns'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Campaign/application analytics for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_analytics_dto_1.AdminUserAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminUserCampaigns", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [creator_analytics_service_1.CreatorAnalyticsService,
        admin_analytics_service_1.AdminAnalyticsService,
        admin_user_analytics_service_1.AdminUserAnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map