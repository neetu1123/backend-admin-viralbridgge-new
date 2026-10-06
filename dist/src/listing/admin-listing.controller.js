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
exports.AdminListingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const listing_service_1 = require("./listing.service");
const listing_dto_1 = require("./listing.dto");
let AdminListingController = class AdminListingController {
    listings;
    constructor(listings) {
        this.listings = listings;
    }
    list(query) {
        return this.listings.adminList(query);
    }
    reports() {
        return this.listings.adminReports();
    }
    analytics() {
        return this.listings.adminAnalytics();
    }
    update(id, body, req) {
        return this.listings.adminUpdate(id, body, req.user.id);
    }
};
exports.AdminListingController = AdminListingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin free listing queue' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listing_dto_1.ListingSearchQueryDto]),
    __metadata("design:returntype", void 0)
], AdminListingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('reports'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminListingController.prototype, "reports", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminListingController.prototype, "analytics", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, listing_dto_1.AdminListingUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], AdminListingController.prototype, "update", null);
exports.AdminListingController = AdminListingController = __decorate([
    (0, swagger_1.ApiTags)('Admin Listings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, common_1.Controller)('admin/listings'),
    __metadata("design:paramtypes", [listing_service_1.ListingService])
], AdminListingController);
//# sourceMappingURL=admin-listing.controller.js.map