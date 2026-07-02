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
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let KycService = class KycService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async getStatus(userId) {
        const [creatorKyc, brandKyc, latestRequest] = await Promise.all([
            this.prisma.creatorKyc.findUnique({ where: { user_id: userId } }),
            this.prisma.brandKyc.findUnique({ where: { user_id: userId } }),
            this.prisma.kycRequest.findFirst({
                where: { user_id: userId },
                orderBy: { submitted_at: 'desc' },
                include: { creator_kyc: true, brand_kyc: true },
            }),
        ]);
        return {
            creatorKyc,
            brandKyc,
            latestRequest,
            status: latestRequest?.status ?? creatorKyc?.verification_status ?? brandKyc?.verification_status ?? 'UNVERIFIED',
        };
    }
    async submitCreator(userId, body) {
        if (!body.instagram_handle || !body.selfie_url) {
            throw new common_1.BadRequestException('instagram_handle and selfie_url are required');
        }
        const data = {
            mobile_number: body.mobile_number ? String(body.mobile_number) : undefined,
            mobile_verified: Boolean(body.mobile_verified),
            email_verified: Boolean(body.email_verified),
            instagram_handle: String(body.instagram_handle),
            youtube_handle: body.youtube_handle ? String(body.youtube_handle) : undefined,
            tiktok_handle: body.tiktok_handle ? String(body.tiktok_handle) : undefined,
            instagram_profile_url: body.instagram_profile_url ? String(body.instagram_profile_url) : undefined,
            selfie_url: String(body.selfie_url),
            followers_count: Number(body.followers_count) || 0,
            engagement_rate: Number(body.engagement_rate) || 0,
            verification_status: 'PENDING',
        };
        const creatorKyc = await this.prisma.creatorKyc.upsert({
            where: { user_id: userId },
            create: { user_id: userId, ...data },
            update: data,
        });
        const kycRequest = await this.prisma.kycRequest.create({
            data: { user_id: userId, user_type: 'CREATOR', status: 'PENDING' },
        });
        await this.prisma.creatorKyc.update({ where: { id: creatorKyc.id }, data: { kyc_request_id: kycRequest.id } });
        await this.prisma.user.update({ where: { id: userId }, data: { status: 'PENDING_KYC' } });
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        await this.notifications.notifyAdmins({
            title: 'New Creator KYC Submission',
            message: `${user?.name ?? 'A creator'} submitted KYC for review.`,
            type: 'KYC',
            entityType: 'KycRequest',
            entityId: kycRequest.id,
        });
        return { kycRequest, creatorKyc };
    }
    async submitBrand(userId, body) {
        if (!body.company_name || !body.business_email || !body.website) {
            throw new common_1.BadRequestException('company_name, business_email, and website are required');
        }
        const data = {
            company_name: String(body.company_name),
            gst_number: body.gst_number ? String(body.gst_number) : undefined,
            website: String(body.website),
            business_email: String(body.business_email),
            business_email_verified: Boolean(body.business_email_verified),
            linkedin_url: body.linkedin_url ? String(body.linkedin_url) : undefined,
            logo_url: body.logo_url ? String(body.logo_url) : undefined,
            business_address: body.business_address ? String(body.business_address) : undefined,
            verification_status: 'PENDING',
        };
        const brandKyc = await this.prisma.brandKyc.upsert({
            where: { user_id: userId },
            create: { user_id: userId, ...data },
            update: data,
        });
        const kycRequest = await this.prisma.kycRequest.create({
            data: { user_id: userId, user_type: 'BRAND', status: 'PENDING' },
        });
        await this.prisma.brandKyc.update({ where: { id: brandKyc.id }, data: { kyc_request_id: kycRequest.id } });
        await this.prisma.user.update({ where: { id: userId }, data: { status: 'PENDING_KYC' } });
        await this.notifications.notifyAdmins({
            title: 'New Brand KYC Submission',
            message: `${data.company_name} submitted KYC for review.`,
            type: 'KYC',
            entityType: 'KycRequest',
            entityId: kycRequest.id,
        });
        return { kycRequest, brandKyc };
    }
    async listAdmin(query) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, query.limit ?? 20);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status.toUpperCase();
        if (query.user_type)
            where.user_type = query.user_type.toUpperCase();
        const [data, total] = await Promise.all([
            this.prisma.kycRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { submitted_at: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    creator_kyc: true,
                    brand_kyc: true,
                },
            }),
            this.prisma.kycRequest.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async approve(requestId, adminId, remarks) {
        const request = await this.prisma.kycRequest.findUnique({
            where: { id: requestId },
            include: { creator_kyc: true, brand_kyc: true },
        });
        if (!request)
            throw new common_1.NotFoundException('KYC request not found');
        await this.prisma.kycRequest.update({
            where: { id: requestId },
            data: { status: 'VERIFIED', reviewed_at: new Date(), reviewed_by: adminId, remarks },
        });
        if (request.user_type === 'CREATOR' && request.creator_kyc) {
            await this.prisma.creatorKyc.update({ where: { id: request.creator_kyc.id }, data: { verification_status: 'VERIFIED' } });
        }
        if (request.user_type === 'BRAND' && request.brand_kyc) {
            await this.prisma.brandKyc.update({ where: { id: request.brand_kyc.id }, data: { verification_status: 'VERIFIED' } });
        }
        await this.prisma.user.update({ where: { id: request.user_id }, data: { is_verified: true, status: 'ACTIVE' } });
        await this.notifications.create({
            userId: request.user_id,
            title: 'KYC Approved',
            message: 'Your identity verification has been approved.',
            type: 'KYC',
            entityType: 'KycRequest',
            entityId: requestId,
        });
        return request;
    }
    async reject(requestId, adminId, remarks) {
        if (!remarks?.trim()) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        const request = await this.prisma.kycRequest.findUnique({
            where: { id: requestId },
            include: { creator_kyc: true, brand_kyc: true },
        });
        if (!request)
            throw new common_1.NotFoundException('KYC request not found');
        await this.prisma.kycRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED', reviewed_at: new Date(), reviewed_by: adminId, remarks },
        });
        if (request.user_type === 'CREATOR' && request.creator_kyc) {
            await this.prisma.creatorKyc.update({ where: { id: request.creator_kyc.id }, data: { verification_status: 'REJECTED' } });
        }
        if (request.user_type === 'BRAND' && request.brand_kyc) {
            await this.prisma.brandKyc.update({ where: { id: request.brand_kyc.id }, data: { verification_status: 'REJECTED' } });
        }
        await this.prisma.user.update({ where: { id: request.user_id }, data: { is_verified: false, status: 'PENDING_KYC' } });
        await this.notifications.create({
            userId: request.user_id,
            title: 'KYC Rejected',
            message: remarks ?? 'Your KYC submission was rejected. Please review and resubmit.',
            type: 'KYC',
            entityType: 'KycRequest',
            entityId: requestId,
        });
        return request;
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], KycService);
//# sourceMappingURL=kyc.service.js.map