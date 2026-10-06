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
exports.DiscoveryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const discovery_dto_1 = require("./discovery.dto");
const discovery_service_1 = require("./discovery.service");
let DiscoveryController = class DiscoveryController {
    discovery;
    constructor(discovery) {
        this.discovery = discovery;
    }
    getCategories(type) {
        return this.discovery.getCategories(type);
    }
    getLocations() {
        return this.discovery.getLocations();
    }
    search(query) {
        return this.discovery.search(query);
    }
    track(body) {
        return this.discovery.trackEvent(body);
    }
    enquiry(slug, body, authorization, req) {
        const forwarded = req?.headers?.['x-forwarded-for'];
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req?.ip;
        return this.discovery.createEnquiry(slug, body, authorization, ip);
    }
    getProfile(slug) {
        return this.discovery.getBySlug(slug);
    }
};
exports.DiscoveryController = DiscoveryController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List discovery categories' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'List discovery cities and areas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search businesses and creators' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discovery_dto_1.DiscoverySearchQueryDto]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('events'),
    (0, swagger_1.ApiOperation)({ summary: 'Track anonymous discovery analytics' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discovery_dto_1.DiscoveryEventDto]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "track", null);
__decorate([
    (0, common_1.Post)(':slug/enquiry'),
    (0, throttler_1.Throttle)({ default: { limit: 8, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Send a public enquiry to a listing' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, discovery_dto_1.DiscoveryEnquiryDto, String, Object]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "enquiry", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a public business or creator discovery profile' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "getProfile", null);
exports.DiscoveryController = DiscoveryController = __decorate([
    (0, swagger_1.ApiTags)('Business Discovery'),
    (0, common_1.Controller)('business'),
    __metadata("design:paramtypes", [discovery_service_1.DiscoveryService])
], DiscoveryController);
//# sourceMappingURL=discovery.controller.js.map