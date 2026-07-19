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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_dto_1 = require("./public.dto");
const public_service_1 = require("./public.service");
let PublicController = class PublicController {
    publicService;
    constructor(publicService) {
        this.publicService = publicService;
    }
    listCreators(query) {
        return this.publicService.listCreators(query);
    }
    getCreator(username) {
        return this.publicService.getCreatorByUsername(username);
    }
    listCampaigns(query) {
        return this.publicService.listCampaigns(query);
    }
    getCampaign(id) {
        return this.publicService.getCampaignById(id);
    }
    getStats() {
        return this.publicService.getPlatformStats();
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('creators'),
    (0, swagger_1.ApiOperation)({ summary: 'List public creators (no auth required)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_dto_1.PublicCreatorsQueryDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listCreators", null);
__decorate([
    (0, common_1.Get)('creators/:username'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public creator profile by username (no auth required)' }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getCreator", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    (0, swagger_1.ApiOperation)({ summary: 'List public campaigns (no auth required)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_dto_1.PublicCampaignsQueryDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listCampaigns", null);
__decorate([
    (0, common_1.Get)('campaigns/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public campaign details (no auth required)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getCampaign", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform statistics (no auth required)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getStats", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('Public'),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map