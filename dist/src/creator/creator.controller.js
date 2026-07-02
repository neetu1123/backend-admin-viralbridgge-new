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
exports.CreatorController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const storage_constants_1 = require("../storage/storage.constants");
const creator_service_1 = require("./creator.service");
const creator_dto_1 = require("./creator.dto");
let CreatorController = class CreatorController {
    creatorService;
    constructor(creatorService) {
        this.creatorService = creatorService;
    }
    getProfile(req) {
        return this.creatorService.getProfile(req.user.id);
    }
    updateProfile(req, body) {
        return this.creatorService.updateProfile(req.user.id, body);
    }
    uploadPhoto(req, body) {
        return this.creatorService.uploadPhoto(req.user.id, body);
    }
    uploadMediaKit(req, body) {
        return this.creatorService.uploadMediaKit(req.user.id, body);
    }
    getCampaigns(req, query) {
        return this.creatorService.getCampaigns(req.user?.id, query);
    }
    getCampaign(id) {
        return this.creatorService.getCampaign(id);
    }
    apply(req, campaignId, body) {
        return this.creatorService.apply(req.user.id, campaignId, body);
    }
    getApplications(req, query) {
        return this.creatorService.getApplications(req.user.id, query);
    }
    getApplication(req, id) {
        return this.creatorService.getApplication(req.user.id, id);
    }
    getDashboard(req) {
        return this.creatorService.getDashboard(req.user.id);
    }
    listEscrows(req) {
        return this.creatorService.listEscrows(req.user.id);
    }
    getDeliverables(req) {
        return this.creatorService.getDeliverables(req.user.id);
    }
    uploadDeliverable(req, files, body) {
        const file = files.file?.[0];
        if (!file)
            throw new common_1.BadRequestException('file is required');
        return this.creatorService.uploadDeliverableMedia(req.user.id, {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        }, {
            campaignId: body.campaign_id,
            thumbnail: files.thumbnail?.[0]
                ? {
                    buffer: files.thumbnail[0].buffer,
                    originalname: files.thumbnail[0].originalname,
                    mimetype: files.thumbnail[0].mimetype,
                    size: files.thumbnail[0].size,
                }
                : undefined,
        });
    }
    submitDeliverableFile(req, id, files, body) {
        const file = files.file?.[0];
        if (!file)
            throw new common_1.BadRequestException('file is required');
        return this.creatorService.submitDeliverableWithFile(req.user.id, id, {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        }, body.notes, files.thumbnail?.[0]
            ? {
                buffer: files.thumbnail[0].buffer,
                originalname: files.thumbnail[0].originalname,
                mimetype: files.thumbnail[0].mimetype,
                size: files.thumbnail[0].size,
            }
            : undefined);
    }
    submitDeliverable(req, id, body) {
        return this.creatorService.submitDeliverable(req.user.id, id, body);
    }
    getWallet(req) {
        return this.creatorService.getWallet(req.user.id);
    }
    sendWithdrawOtp(req) {
        return this.creatorService.sendWithdrawOtp(req.user.id);
    }
    withdraw(req, body) {
        return this.creatorService.withdraw(req.user.id, body);
    }
    getWalletTransactions(req, query) {
        return this.creatorService.getWalletTransactions(req.user.id, query);
    }
    getConversations(req) {
        return this.creatorService.getConversations(req.user.id);
    }
    getMessages(req, conversationId) {
        return this.creatorService.getMessages(req.user.id, conversationId);
    }
    sendMessage(req, body) {
        return this.creatorService.sendMessage(req.user.id, body);
    }
    getUnreadNotificationCount(req) {
        return this.creatorService.getUnreadNotificationCount(req.user.id);
    }
    markAllNotificationsRead(req) {
        return this.creatorService.markAllNotificationsRead(req.user.id);
    }
    getNotifications(req, query) {
        return this.creatorService.getNotifications(req.user.id, query);
    }
    markNotificationRead(req, id) {
        return this.creatorService.markNotificationRead(req.user.id, id);
    }
    getSettings(req) {
        return this.creatorService.getSettings(req.user.id);
    }
    updateSettings(req, body) {
        return this.creatorService.updateSettings(req.user.id, body);
    }
};
exports.CreatorController = CreatorController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.UpdateCreatorProfileDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('upload-photo'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.UploadDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Post)('upload-media-kit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.UploadDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "uploadMediaKit", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.CreatorCampaignQueryDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Get)('campaigns/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getCampaign", null);
__decorate([
    (0, common_1.Post)('apply/:campaignId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, creator_dto_1.ApplyCampaignDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.ApplicationQueryDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Get)('applications/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getApplication", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('escrows'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "listEscrows", null);
__decorate([
    (0, common_1.Get)('deliverables'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getDeliverables", null);
__decorate([
    (0, common_1.Post)('deliverables/upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload deliverable video/image (returns URL)' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ], { limits: { fileSize: storage_constants_1.DELIVERABLE_MAX_UPLOAD_BYTES } })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "uploadDeliverable", null);
__decorate([
    (0, common_1.Post)('deliverables/:id/submit-file'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload and submit deliverable in one step' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ], { limits: { fileSize: storage_constants_1.DELIVERABLE_MAX_UPLOAD_BYTES } })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "submitDeliverableFile", null);
__decorate([
    (0, common_1.Post)('deliverables/:id/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, creator_dto_1.SubmitDeliverableDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "submitDeliverable", null);
__decorate([
    (0, common_1.Get)('wallet'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Post)('wallet/withdraw-otp'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "sendWithdrawOtp", null);
__decorate([
    (0, common_1.Post)('wallet/withdraw'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.WithdrawDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Get)('wallet/transactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.TransactionQueryDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getWalletTransactions", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('messages/:conversationId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('messages/send'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.SendMessageDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('notifications/unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getUnreadNotificationCount", null);
__decorate([
    (0, common_1.Patch)('notifications/read-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "markAllNotificationsRead", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, creator_dto_1.NotificationQueryDto]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "markNotificationRead", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CreatorController.prototype, "updateSettings", null);
exports.CreatorController = CreatorController = __decorate([
    (0, swagger_1.ApiTags)('Creator'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, common_1.Controller)('creator'),
    __metadata("design:paramtypes", [creator_service_1.CreatorService])
], CreatorController);
//# sourceMappingURL=creator.controller.js.map