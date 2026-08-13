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
exports.AdminSupportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const support_dto_1 = require("./support.dto");
const support_service_1 = require("./support.service");
let AdminSupportController = class AdminSupportController {
    support;
    constructor(support) {
        this.support = support;
    }
    getSummary() {
        return this.support.getAdminSummary();
    }
    getCases(query, req) {
        return this.support.getAdminCases(query, req.user?.id);
    }
    getCase(caseId) {
        return this.support.getAdminCase(caseId);
    }
    updateCase(caseId, body, req) {
        return this.support.adminUpdateCase(caseId, body, req.user.id);
    }
    assign(caseId, body, req) {
        return this.support.adminAssign(caseId, req.user.id, body.adminId);
    }
    reply(caseId, body, req) {
        return this.support.adminReply(caseId, req.user.id, body.message);
    }
    addNote(caseId, body, req) {
        return this.support.adminAddNote(caseId, req.user.id, body);
    }
    resolve(caseId, req) {
        return this.support.adminResolve(caseId, req.user.id);
    }
    close(caseId, req) {
        return this.support.adminClose(caseId, req.user.id);
    }
    reopen(caseId, req) {
        return this.support.adminReopen(caseId, req.user.id);
    }
};
exports.AdminSupportController = AdminSupportController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Support dashboard summary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('cases'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.AdminCaseQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "getCases", null);
__decorate([
    (0, common_1.Get)('cases/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "getCase", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.AdminUpdateCaseDto, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "updateCase", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/assign'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.AdminAssignDto, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/messages'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "reply", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/notes'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.AdminNoteDto, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "addNote", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/resolve'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/close'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "close", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/reopen'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminSupportController.prototype, "reopen", null);
exports.AdminSupportController = AdminSupportController = __decorate([
    (0, swagger_1.ApiTags)('Admin Support'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    (0, common_1.Controller)('admin/support'),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], AdminSupportController);
//# sourceMappingURL=admin-support.controller.js.map