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
exports.UserProvisioningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserProvisioningService = class UserProvisioningService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async provisionUserResources(userId, roleName, displayName) {
        await this.prisma.$transaction(async (tx) => {
            await tx.wallet.upsert({
                where: { user_id: userId },
                update: {},
                create: {
                    user_id: userId,
                    available_balance: 0,
                    locked_balance: 0,
                    pending_balance: 0,
                    lifetime_earnings: 0,
                    currency: 'INR',
                },
            });
            await tx.securitySetting.upsert({
                where: { user_id: userId },
                update: {},
                create: { user_id: userId },
            });
            await tx.notificationPreference.upsert({
                where: { user_id: userId },
                update: {},
                create: { user_id: userId },
            });
            const kycRequest = await tx.kycRequest.create({
                data: {
                    user_id: userId,
                    user_type: roleName,
                    status: 'PENDING',
                },
            });
            if (roleName === 'CREATOR') {
                await tx.creatorKyc.upsert({
                    where: { user_id: userId },
                    update: {},
                    create: {
                        user_id: userId,
                        kyc_request_id: kycRequest.id,
                        verification_status: 'UNVERIFIED',
                    },
                });
            }
            if (roleName === 'BRAND') {
                await tx.brandKyc.upsert({
                    where: { user_id: userId },
                    update: {},
                    create: {
                        user_id: userId,
                        kyc_request_id: kycRequest.id,
                        company_name: displayName,
                        verification_status: 'UNVERIFIED',
                    },
                });
            }
        });
    }
};
exports.UserProvisioningService = UserProvisioningService;
exports.UserProvisioningService = UserProvisioningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserProvisioningService);
//# sourceMappingURL=user-provisioning.service.js.map