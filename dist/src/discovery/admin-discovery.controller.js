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
exports.AdminDiscoveryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const discovery_dto_1 = require("./discovery.dto");
const discovery_service_1 = require("./discovery.service");
let AdminDiscoveryController = class AdminDiscoveryController {
    discovery;
    constructor(discovery) {
        this.discovery = discovery;
    }
    list(query) {
        return this.discovery.adminList(query);
    }
    analytics() {
        return this.discovery.adminAnalytics();
    }
    categories() {
        return this.discovery.getCategories();
    }
    update(type, id, body, req) {
        return this.discovery.adminUpdate(id, type, body, req.user.id);
    }
};
exports.AdminDiscoveryController = AdminDiscoveryController;
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin search of discovery listings' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discovery_dto_1.DiscoverySearchQueryDto]),
    __metadata("design:returntype", void 0)
], AdminDiscoveryController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Discovery analytics summary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminDiscoveryController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminDiscoveryController.prototype, "categories", null);
__decorate([
    (0, common_1.Patch)('listings/:type/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify, feature, hide, or update public visibility' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, discovery_dto_1.AdminDiscoveryUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], AdminDiscoveryController.prototype, "update", null);
exports.AdminDiscoveryController = AdminDiscoveryController = __decorate([
    (0, swagger_1.ApiTags)('Admin Discovery'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, common_1.Controller)('admin/discovery'),
    __metadata("design:paramtypes", [discovery_service_1.DiscoveryService])
], AdminDiscoveryController);
//# sourceMappingURL=admin-discovery.controller.js.map