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
exports.BrandController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const brand_service_1 = require("./brand.service");
const brand_dto_1 = require("./brand.dto");
let BrandController = class BrandController {
    brandService;
    constructor(brandService) {
        this.brandService = brandService;
    }
    getProfile(req) {
        return this.brandService.getProfile(req.user.id);
    }
    updateProfile(req, body) {
        return this.brandService.updateProfile(req.user.id, body);
    }
    createCampaign(req, body) {
        return this.brandService.createCampaign(req.user.id, body);
    }
    getCampaigns(req, query) {
        return this.brandService.getCampaigns(req.user.id, query);
    }
    getCampaign(req, id) {
        return this.brandService.getCampaign(req.user.id, id);
    }
    getCampaignDetail(req, id) {
        return this.brandService.getCampaignDetail(req.user.id, id);
    }
    updateCampaign(req, id, body) {
        return this.brandService.updateCampaign(req.user.id, id, body);
    }
    deleteCampaign(req, id) {
        return this.brandService.deleteCampaign(req.user.id, id);
    }
    getApplicants(req, id) {
        return this.brandService.getApplicants(req.user.id, id);
    }
    getCampaignRecommendations(req, id) {
        return this.brandService.getCampaignRecommendations(req.user.id, id);
    }
    approveApplication(req, id) {
        return this.brandService.updateApplication(req.user.id, id, 'ACCEPTED');
    }
    rejectApplication(req, id) {
        return this.brandService.updateApplication(req.user.id, id, 'REJECTED');
    }
    shortlistApplication(req, id) {
        return this.brandService.updateApplication(req.user.id, id, 'SHORTLISTED');
    }
    inviteCreator(req, id, creatorId) {
        return this.brandService.inviteCreator(req.user.id, id, creatorId);
    }
    getCreators(query) {
        return this.brandService.getCreators(query);
    }
    getMyCreators(req, query) {
        return this.brandService.getMyCreators(req.user.id, query);
    }
    getCampaignDeliverables(req, id) {
        return this.brandService.getCampaignDeliverables(req.user.id, id);
    }
    approveDeliverable(req, id) {
        return this.brandService.reviewDeliverable(req.user.id, id, 'APPROVED');
    }
    reviseDeliverable(req, id, body) {
        return this.brandService.reviewDeliverable(req.user.id, id, 'REVISION_REQUESTED', body.notes);
    }
    rejectDeliverable(req, id, body) {
        return this.brandService.reviewDeliverable(req.user.id, id, 'REJECTED', body.notes);
    }
    listEscrows(req) {
        return this.brandService.listEscrows(req.user.id);
    }
    releaseEscrow(req, id) {
        return this.brandService.releaseEscrow(req.user.id, id);
    }
    getDashboard(req) {
        return this.brandService.getDashboard(req.user.id);
    }
    getWallet(req) {
        return this.brandService.getWallet(req.user.id);
    }
    addFunds(req, body) {
        return this.brandService.addFunds(req.user.id, body);
    }
    createPaymentOrder(req, body) {
        return this.brandService.createPaymentOrder(req.user.id, body.amount);
    }
    verifyPayment(req, body) {
        return this.brandService.verifyPayment(req.user.id, body);
    }
    getRazorpayKey() {
        return this.brandService.getRazorpayKey();
    }
    getWalletTransactions(req, query) {
        return this.brandService.getWalletTransactions(req.user.id, query);
    }
    getAnalytics(req) {
        return this.brandService.getAnalytics(req.user.id);
    }
    getRoi(req) {
        return this.brandService.getRoi(req.user.id);
    }
    getTopCreators(req) {
        return this.brandService.getTopCreators(req.user.id);
    }
    getConversations(req) {
        return this.brandService.getConversations(req.user.id);
    }
    getMessages(req, conversationId) {
        return this.brandService.getMessages(req.user.id, conversationId);
    }
    sendMessage(req, body) {
        return this.brandService.sendMessage(req.user.id, body);
    }
    getUnreadNotificationCount(req) {
        return this.brandService.getUnreadNotificationCount(req.user.id);
    }
    markAllNotificationsRead(req) {
        return this.brandService.markAllNotificationsRead(req.user.id);
    }
    getNotifications(req, query) {
        return this.brandService.getNotifications(req.user.id, query);
    }
    markNotificationRead(req, id) {
        return this.brandService.markNotificationRead(req.user.id, id);
    }
    getSettings(req) {
        return this.brandService.getSettings(req.user.id);
    }
    updateSettings(req, body) {
        return this.brandService.updateSettings(req.user.id, body);
    }
};
exports.BrandController = BrandController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.UpdateBrandProfileDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('campaigns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.CampaignDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.BrandCampaignQueryDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Get)('campaigns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getCampaign", null);
__decorate([
    (0, common_1.Get)('campaigns/:id/detail'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getCampaignDetail", null);
__decorate([
    (0, common_1.Put)('campaigns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, brand_dto_1.CampaignDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "updateCampaign", null);
__decorate([
    (0, common_1.Delete)('campaigns/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "deleteCampaign", null);
__decorate([
    (0, common_1.Get)('campaigns/:id/applicants'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getApplicants", null);
__decorate([
    (0, common_1.Get)('campaigns/:id/recommendations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getCampaignRecommendations", null);
__decorate([
    (0, common_1.Post)('applications/:id/approve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "approveApplication", null);
__decorate([
    (0, common_1.Post)('applications/:id/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "rejectApplication", null);
__decorate([
    (0, common_1.Post)('applications/:id/shortlist'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "shortlistApplication", null);
__decorate([
    (0, common_1.Post)('campaigns/:id/invite/:creatorId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "inviteCreator", null);
__decorate([
    (0, common_1.Get)('creators'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [brand_dto_1.CreatorDiscoveryQueryDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getCreators", null);
__decorate([
    (0, common_1.Get)('my-creators'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.CreatorDiscoveryQueryDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getMyCreators", null);
__decorate([
    (0, common_1.Get)('campaigns/:id/deliverables'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getCampaignDeliverables", null);
__decorate([
    (0, common_1.Post)('deliverables/:id/approve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "approveDeliverable", null);
__decorate([
    (0, common_1.Post)('deliverables/:id/revise'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, brand_dto_1.RevisionDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "reviseDeliverable", null);
__decorate([
    (0, common_1.Post)('deliverables/:id/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, brand_dto_1.RevisionDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "rejectDeliverable", null);
__decorate([
    (0, common_1.Get)('escrows'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "listEscrows", null);
__decorate([
    (0, common_1.Post)('escrows/:id/release'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "releaseEscrow", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('wallet'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Post)('wallet/add-funds'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.FundsDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "addFunds", null);
__decorate([
    (0, common_1.Post)('wallet/create-order'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.CreatePaymentOrderDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "createPaymentOrder", null);
__decorate([
    (0, common_1.Post)('wallet/verify-payment'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('wallet/razorpay-key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getRazorpayKey", null);
__decorate([
    (0, common_1.Get)('wallet/transactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.TransactionQueryDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getWalletTransactions", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/roi'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getRoi", null);
__decorate([
    (0, common_1.Get)('analytics/top-creators'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getTopCreators", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('messages/:conversationId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('messages/send'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.SendMessageDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('notifications/unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getUnreadNotificationCount", null);
__decorate([
    (0, common_1.Patch)('notifications/read-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "markAllNotificationsRead", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, brand_dto_1.NotificationQueryDto]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "markNotificationRead", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BrandController.prototype, "updateSettings", null);
exports.BrandController = BrandController = __decorate([
    (0, swagger_1.ApiTags)('Brand'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('BRAND', 'ADMIN', 'SUPER_ADMIN'),
    (0, common_1.Controller)('brand'),
    __metadata("design:paramtypes", [brand_service_1.BrandService])
], BrandController);
//# sourceMappingURL=brand.controller.js.map