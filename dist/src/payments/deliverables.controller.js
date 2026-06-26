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
exports.DeliverablesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const deliverables_service_1 = require("./deliverables.service");
const deliverables_dto_1 = require("./dto/deliverables.dto");
let DeliverablesController = class DeliverablesController {
    deliverablesService;
    constructor(deliverablesService) {
        this.deliverablesService = deliverablesService;
    }
    submit(req, body) {
        return this.deliverablesService.submit(req.user.id, body);
    }
    list(req, campaignId) {
        return this.deliverablesService.listByCampaign(req.user.id, campaignId, req.user.role?.name);
    }
    requestRevision(req, id, body) {
        return this.deliverablesService.requestRevision(req.user.id, id, body);
    }
    approve(req, id) {
        return this.deliverablesService.approve(req.user.id, id);
    }
    reject(req, id, body) {
        return this.deliverablesService.reject(req.user.id, id, body);
    }
};
exports.DeliverablesController = DeliverablesController;
__decorate([
    (0, common_1.Post)('submit'),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit deliverable (requires escrow HELD)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, deliverables_dto_1.SubmitDeliverableDto]),
    __metadata("design:returntype", void 0)
], DeliverablesController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)(':campaignId'),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'List deliverables for a campaign' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DeliverablesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/request-revision'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Request revision on a deliverable' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, deliverables_dto_1.DeliverableRevisionDto]),
    __metadata("design:returntype", void 0)
], DeliverablesController.prototype, "requestRevision", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve deliverable and release escrow when all approved' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DeliverablesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a deliverable' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, deliverables_dto_1.DeliverableRejectDto]),
    __metadata("design:returntype", void 0)
], DeliverablesController.prototype, "reject", null);
exports.DeliverablesController = DeliverablesController = __decorate([
    (0, swagger_1.ApiTags)('Deliverables'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('deliverables'),
    __metadata("design:paramtypes", [deliverables_service_1.DeliverablesService])
], DeliverablesController);
//# sourceMappingURL=deliverables.controller.js.map