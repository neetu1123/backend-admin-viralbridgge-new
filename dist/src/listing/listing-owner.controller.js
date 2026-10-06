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
exports.ListingOwnerController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const storage_constants_1 = require("../storage/storage.constants");
const listing_service_1 = require("./listing.service");
const listing_dto_1 = require("./listing.dto");
let ListingOwnerController = class ListingOwnerController {
    listings;
    constructor(listings) {
        this.listings = listings;
    }
    create(req, body) {
        return this.listings.create(req.user.id, body);
    }
    mine(req) {
        return this.listings.getMine(req.user.id);
    }
    enquiries(req) {
        return this.listings.getEnquiries(req.user.id);
    }
    analytics(req) {
        return this.listings.getAnalytics(req.user.id);
    }
    upload(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('image file is required');
        }
        return this.listings.uploadImage(req.user.id, {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        });
    }
    update(req, id, body) {
        return this.listings.update(req.user.id, id, body);
    }
    publish(req, id) {
        return this.listings.publish(req.user.id, id);
    }
    unpublish(req, id) {
        return this.listings.unpublish(req.user.id, id);
    }
    archive(req, id) {
        return this.listings.archive(req.user.id, id);
    }
    upgrade(req, id) {
        return this.listings.upgrade(req.user.id, id);
    }
};
exports.ListingOwnerController = ListingOwnerController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create or resume a free listing draft' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, listing_dto_1.CreateListingDto]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('me/enquiries'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "enquiries", null);
__decorate([
    (0, common_1.Get)('me/analytics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "analytics", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', { limits: { fileSize: storage_constants_1.PROFILE_MAX_UPLOAD_BYTES } })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "upload", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/unpublish'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/upgrade'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ListingOwnerController.prototype, "upgrade", null);
exports.ListingOwnerController = ListingOwnerController = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listing_service_1.ListingService])
], ListingOwnerController);
//# sourceMappingURL=listing-owner.controller.js.map