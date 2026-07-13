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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserActivityService = class UserActivityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    now() {
        return new Date();
    }
    async touch(userId, fields) {
        const list = Array.isArray(fields) ? fields : [fields];
        const ts = this.now();
        const data = {};
        for (const field of list) {
            data[field] = ts;
        }
        try {
            await this.prisma.userActivity.upsert({
                where: { user_id: userId },
                create: { user_id: userId, ...data },
                update: data,
            });
        }
        catch (e) {
            console.error('UserActivity touch failed:', e);
        }
    }
    async recordLogin(userId) {
        return this.touch(userId, ['last_login', 'last_active']);
    }
    async recordActive(userId) {
        return this.touch(userId, 'last_active');
    }
    async recordCampaignActivity(userId) {
        return this.touch(userId, ['last_campaign_activity', 'last_active']);
    }
    async recordWalletActivity(userId) {
        return this.touch(userId, ['last_wallet_activity', 'last_active']);
    }
    async recordMessageActivity(userId) {
        return this.touch(userId, ['last_message_activity', 'last_active']);
    }
    async getActivity(userId) {
        return this.prisma.userActivity.findUnique({ where: { user_id: userId } });
    }
    async getOrCreate(userId) {
        const existing = await this.getActivity(userId);
        if (existing)
            return existing;
        return this.prisma.userActivity.create({ data: { user_id: userId } });
    }
};
exports.UserActivityService = UserActivityService;
exports.UserActivityService = UserActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserActivityService);
//# sourceMappingURL=user-activity.service.js.map