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
exports.PlatformWalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const constants_1 = require("./constants");
let PlatformWalletService = class PlatformWalletService {
    prisma;
    platformUserId = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlatformWallet(tx) {
        const client = tx ?? this.prisma;
        const userId = await this.ensurePlatformUser(client);
        return client.wallet.upsert({
            where: { user_id: userId },
            update: {},
            create: {
                user_id: userId,
                is_platform: true,
                currency: 'INR',
            },
        });
    }
    async creditPlatformFee(tx, amount, referenceId) {
        if (amount <= 0)
            return null;
        const wallet = await this.getPlatformWallet(tx);
        const updated = await tx.wallet.update({
            where: { id: wallet.id },
            data: { available_balance: { increment: amount } },
        });
        await tx.walletTransaction.create({
            data: {
                wallet_id: wallet.id,
                type: constants_1.TRANSACTION_TYPES.PLATFORM_FEE,
                amount,
                balance_after: updated.available_balance,
                reference_type: 'Escrow',
                reference_id: referenceId,
                status: 'COMPLETED',
            },
        });
        return updated;
    }
    async ensurePlatformUser(client) {
        if (this.platformUserId)
            return this.platformUserId;
        const existing = await client.wallet.findFirst({
            where: { is_platform: true },
            select: { user_id: true },
        });
        if (existing) {
            this.platformUserId = existing.user_id;
            return existing.user_id;
        }
        const role = await client.role.upsert({
            where: { name: 'PLATFORM' },
            update: {},
            create: { name: 'PLATFORM', description: 'Platform treasury account' },
        });
        const user = await client.user.create({
            data: {
                email: 'platform@viralbridge.internal',
                name: 'ViralBridge Platform',
                role_id: role.id,
                is_verified: true,
                wallets: {
                    create: { is_platform: true, currency: 'INR' },
                },
            },
        });
        this.platformUserId = user.id;
        return user.id;
    }
};
exports.PlatformWalletService = PlatformWalletService;
exports.PlatformWalletService = PlatformWalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlatformWalletService);
//# sourceMappingURL=platform-wallet.service.js.map