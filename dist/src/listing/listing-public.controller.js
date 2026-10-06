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
exports.ListingPublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const listing_service_1 = require("./listing.service");
const listing_dto_1 = require("./listing.dto");
let ListingPublicController = class ListingPublicController {
    listings;
    constructor(listings) {
        this.listings = listings;
    }
    categories(type) {
        return this.listings.getCategories(type);
    }
    locations() {
        return this.listings.getLocations();
    }
    search(query) {
        return this.listings.searchPublic(query);
    }
    track(body) {
        return this.listings.trackEvent(body);
    }
    enquiry(id, body, authorization, req) {
        const forwarded = req?.headers?.['x-forwarded-for'];
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req?.ip;
        return this.listings.createEnquiry(id, body, authorization, ip);
    }
    report(id, body) {
        return this.listings.report(id, body);
    }
    business(slug) {
        return this.listings.getPublic('BUSINESS', slug);
    }
    creator(slug) {
        return this.listings.getPublic('CREATOR', slug);
    }
};
exports.ListingPublicController = ListingPublicController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Public discover categories' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Public discover cities' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "locations", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search published free listings and existing discover profiles' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listing_dto_1.ListingSearchQueryDto]),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listing_dto_1.ListingEventDto]),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "track", null);
__decorate([
    (0, common_1.Post)(':id/enquiry'),
    (0, throttler_1.Throttle)({ default: { limit: 8, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, listing_dto_1.ListingEnquiryDto, String, Object]),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "enquiry", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, listing_dto_1.ListingReportDto]),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "report", null);
__decorate([
    (0, common_1.Get)('business/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "business", null);
__decorate([
    (0, common_1.Get)('creator/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingPublicController.prototype, "creator", null);
exports.ListingPublicController = ListingPublicController = __decorate([
    (0, swagger_1.ApiTags)('Discover'),
    (0, common_1.Controller)('discover'),
    __metadata("design:paramtypes", [listing_service_1.ListingService])
], ListingPublicController);
//# sourceMappingURL=listing-public.controller.js.map