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
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const support_dto_1 = require("./support.dto");
const support_service_1 = require("./support.service");
let SupportController = class SupportController {
    support;
    constructor(support) {
        this.support = support;
    }
    userRole(req) {
        return req.user?.role?.name ?? 'CREATOR';
    }
    getCategories(req) {
        return this.support.getCategories(this.userRole(req));
    }
    getCategory(categoryId, req) {
        return this.support.getCategory(categoryId, this.userRole(req));
    }
    getIssue(issueId, req) {
        return this.support.getIssue(issueId, this.userRole(req));
    }
    search(query, req) {
        return this.support.search(this.userRole(req), query.q);
    }
    resolve(body, req) {
        return this.support.resolve(req.user.id, this.userRole(req), body);
    }
    createCase(body, req) {
        return this.support.createCase(req.user.id, this.userRole(req), body);
    }
    getCases(req) {
        return this.support.getUserCases(req.user.id);
    }
    getCase(caseId, req) {
        return this.support.getUserCase(req.user.id, caseId);
    }
    sendMessage(caseId, body, req) {
        return this.support.sendMessage(req.user.id, this.userRole(req), caseId, body.message);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get support categories for current user role' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('categories/:categoryId'),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getCategory", null);
__decorate([
    (0, common_1.Get)('issues/:issueId'),
    __param(0, (0, common_1.Param)('issueId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getIssue", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.SearchQueryDto, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('resolve'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.ResolveSupportDto, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('cases'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.CreateSupportCaseDto, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "createCase", null);
__decorate([
    (0, common_1.Get)('cases'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getCases", null);
__decorate([
    (0, common_1.Get)('cases/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getCase", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/messages'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "sendMessage", null);
exports.SupportController = SupportController = __decorate([
    (0, swagger_1.ApiTags)('Support'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, common_1.Controller)('support'),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportController);
//# sourceMappingURL=support.controller.js.map