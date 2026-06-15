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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getRoles() { return this.adminService.getRoles(); }
    createRole(body, req) {
        return this.adminService.createRole(body.name, body.description, req.user?.id);
    }
    updateRole(id, body, req) {
        return this.adminService.updateRole(id, body.name, body.description, req.user?.id);
    }
    deleteRole(id, req) {
        return this.adminService.deleteRole(id, req.user?.id);
    }
    getAdmins() { return this.adminService.getAdmins(); }
    assignRoleByEmail(body, req) {
        return this.adminService.assignRoleByEmail(body, req.user?.id);
    }
    getUsers() { return this.adminService.getUsers(); }
    getUser(id) { return this.adminService.getUser(id); }
    updateUserRole(id, body, req) {
        return this.adminService.updateUserRole(id, body.role_id, req.user?.id);
    }
    banUser(id, req) {
        return this.adminService.banUser(id, req.user?.id);
    }
    unbanUser(id, req) {
        return this.adminService.unbanUser(id, req.user?.id);
    }
    getCampaigns() { return this.adminService.getCampaigns(); }
    getFlaggedCampaigns() { return this.adminService.getFlaggedCampaigns(); }
    approveCampaign(id, req) {
        return this.adminService.approveCampaign(id, req.user?.id);
    }
    rejectCampaign(id, req) {
        return this.adminService.rejectCampaign(id, req.user?.id);
    }
    flagCampaign(id, body, req) {
        return this.adminService.flagCampaign(id, body.reason ?? '', req.user?.id);
    }
    getTransactions() { return this.adminService.getTransactions(); }
    getDashboardStats() { return this.adminService.getDashboardStats(); }
    getSettings() {
        return this.adminService.getSettings();
    }
    updateSettings(body, req) {
        return this.adminService.updateSettings(body, req.user?.id);
    }
    getMatches() {
        return this.adminService.getMatches();
    }
    updateMatch(id, body, req) {
        return this.adminService.updateMatch(id, body.status, req.user?.id);
    }
    runMatching() {
        return this.adminService.runMatching();
    }
    getAuditLogs(page, limit, entity, action, admin_id) {
        return this.adminService.getAuditLogs({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50,
            entity,
            action,
            admin_id,
        });
    }
    getAuditLogStats() {
        return this.adminService.getAuditLogStats();
    }
    createAuditLog(body, req) {
        return this.adminService.createAuditLog({
            admin_id: req.user?.id,
            action: body.action,
            entity: body.entity,
            entity_id: body.entity_id,
            metadata: body.metadata,
        });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('roles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('admins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAdmins", null);
__decorate([
    (0, common_1.Post)('admins/assign'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "assignRoleByEmail", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/unban'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "unbanUser", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Get)('campaigns/flagged'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFlaggedCampaigns", null);
__decorate([
    (0, common_1.Post)('campaigns/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveCampaign", null);
__decorate([
    (0, common_1.Post)('campaigns/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectCampaign", null);
__decorate([
    (0, common_1.Post)('campaigns/:id/flag'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "flagCampaign", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update platform settings' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('matching'),
    (0, swagger_1.ApiOperation)({ summary: 'List AI creator-campaign matches' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMatches", null);
__decorate([
    (0, common_1.Patch)('matching/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update match status (active, removed, forced)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateMatch", null);
__decorate([
    (0, common_1.Post)('matching/run'),
    (0, swagger_1.ApiOperation)({ summary: 'Recompute AI matches for all active campaigns' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "runMatching", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated audit logs with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'entity', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'admin_id', required: false, type: String }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, common_1.Query)('action')),
    __param(4, (0, common_1.Query)('admin_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('audit-logs/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log statistics (total, today, by entity)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogStats", null);
__decorate([
    (0, common_1.Post)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually create an audit log entry' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createAuditLog", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map