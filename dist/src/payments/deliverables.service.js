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
exports.DeliverablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const wallet_event_emitter_1 = require("../common/wallet-event-emitter");
const constants_1 = require("./constants");
const escrow_service_1 = require("./escrow.service");
const storage_service_1 = require("../storage/storage.service");
let DeliverablesService = class DeliverablesService {
    prisma;
    notifications;
    escrowService;
    storage;
    constructor(prisma, notifications, escrowService, storage) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.escrowService = escrowService;
        this.storage = storage;
    }
    async uploadMedia(userId, file, options) {
        await this.ensureCreatorProfile(userId);
        return this.storage.uploadDeliverable({
            userId,
            file,
            thumbnail: options?.thumbnail,
            campaignId: options?.campaignId,
        });
    }
    async submitWithUpload(userId, deliverableId, file, notes, thumbnail) {
        const deliverable = await this.prisma.deliverable.findUnique({
            where: { id: deliverableId },
            select: { campaign_id: true },
        });
        if (!deliverable)
            throw new common_1.NotFoundException('Deliverable not found');
        const upload = await this.uploadMedia(userId, file, {
            campaignId: deliverable.campaign_id,
            thumbnail,
        });
        return this.submit(userId, {
            deliverable_id: deliverableId,
            file_url: upload.url,
            thumbnailUrl: upload.thumbnailUrl,
            notes,
        });
    }
    async ensureCreatorProfile(userId) {
        const profile = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
        if (!profile)
            throw new common_1.ForbiddenException('Creator profile required');
        return profile;
    }
    async submit(userId, dto) {
        const profile = await this.prisma.creatorProfile.findUnique({
            where: { user_id: userId },
            include: { user: true },
        });
        if (!profile)
            throw new common_1.ForbiddenException('Creator profile required');
        const deliverableId = dto.deliverable_id;
        const deliverable = await this.prisma.deliverable.findUnique({
            where: { id: deliverableId },
            include: { campaign: { include: { brand: { include: { user: true } } } } },
        });
        if (!deliverable)
            throw new common_1.NotFoundException('Deliverable not found');
        if (deliverable.creator_id !== profile.id)
            throw new common_1.ForbiddenException('Forbidden');
        await this.assertEscrowHeld(deliverable.campaign_id, deliverable.creator_id);
        const fileUrl = dto.file_url || dto.mediaUrl;
        if (!fileUrl)
            throw new common_1.BadRequestException('file_url is required');
        const now = new Date();
        const autoReleaseAt = new Date(now);
        autoReleaseAt.setDate(autoReleaseAt.getDate() + constants_1.AUTO_RELEASE_DAYS);
        const isResubmission = deliverable.status === constants_1.DELIVERABLE_STATUSES.REVISION_REQUESTED ||
            deliverable.status === constants_1.DELIVERABLE_STATUSES.REJECTED;
        const updated = await this.prisma.deliverable.update({
            where: { id: deliverableId },
            data: {
                file_url: fileUrl,
                media_url: fileUrl,
                thumbnail_url: dto.thumbnailUrl,
                notes: dto.notes,
                title: dto.title ?? deliverable.title,
                status: constants_1.DELIVERABLE_STATUSES.SUBMITTED,
                submitted_at: now,
                reviewed_at: null,
                auto_release_at: autoReleaseAt,
                version: isResubmission ? { increment: 1 } : deliverable.version,
            },
        });
        await this.notifications.create({
            userId: deliverable.campaign.brand.user_id,
            title: 'Deliverables Submitted',
            message: `${profile.full_name ?? profile.user.name} submitted deliverables for ${deliverable.campaign.title}.`,
            type: 'SYSTEM',
            entityType: 'Deliverable',
            entityId: deliverable.id,
            metadata: { campaignId: deliverable.campaign_id, status: constants_1.DELIVERABLE_STATUSES.SUBMITTED },
        });
        (0, wallet_event_emitter_1.emitWalletEvent)(deliverable.campaign.brand.user_id, 'deliverable:submitted', updated);
        return this.formatDeliverable(updated);
    }
    async listByCampaign(userId, campaignId, roleName) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { brand: true },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const creator = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
        const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
        const isAdmin = roleName === 'ADMIN' || roleName === 'SUPER_ADMIN';
        if (!isAdmin) {
            const isBrand = brand?.id === campaign.brand_id;
            const isCreator = creator
                ? await this.prisma.deliverable.count({
                    where: { campaign_id: campaignId, creator_id: creator.id },
                }) > 0
                : false;
            if (!isBrand && !isCreator)
                throw new common_1.ForbiddenException('Access denied');
        }
        const deliverables = await this.prisma.deliverable.findMany({
            where: { campaign_id: campaignId },
            include: { creator: { include: { user: true } }, application: true },
            orderBy: { created_at: 'desc' },
        });
        return deliverables.map((d) => this.formatDeliverable(d));
    }
    async approve(userId, deliverableId) {
        const deliverable = await this.getBrandOwnedDeliverable(userId, deliverableId);
        const updated = await this.prisma.deliverable.update({
            where: { id: deliverableId },
            data: {
                status: constants_1.DELIVERABLE_STATUSES.APPROVED,
                reviewed_at: new Date(),
                auto_release_at: null,
            },
        });
        await this.notifications.create({
            userId: deliverable.creator.user_id,
            title: 'Deliverable Approved',
            message: `Your deliverable for ${deliverable.campaign.title} was approved.`,
            type: 'SYSTEM',
            entityType: 'Deliverable',
            entityId: deliverable.id,
        });
        await this.tryReleaseEscrowAfterApproval(deliverable.campaign_id, deliverable.creator_id);
        return this.formatDeliverable(updated);
    }
    async requestRevision(userId, deliverableId, dto) {
        const deliverable = await this.getBrandOwnedDeliverable(userId, deliverableId);
        const updated = await this.prisma.deliverable.update({
            where: { id: deliverableId },
            data: {
                status: constants_1.DELIVERABLE_STATUSES.REVISION_REQUESTED,
                revision_notes: dto.notes,
                reviewed_at: new Date(),
                auto_release_at: null,
            },
        });
        await this.notifications.create({
            userId: deliverable.creator.user_id,
            title: 'Revision Requested',
            message: dto.notes
                ? `Revision requested for ${deliverable.campaign.title}: ${dto.notes}`
                : `Revision requested for ${deliverable.campaign.title}.`,
            type: 'SYSTEM',
            entityType: 'Deliverable',
            entityId: deliverable.id,
        });
        (0, wallet_event_emitter_1.emitWalletEvent)(deliverable.creator.user_id, 'deliverable:revision_requested', updated);
        return this.formatDeliverable(updated);
    }
    async reject(userId, deliverableId, dto) {
        const deliverable = await this.getBrandOwnedDeliverable(userId, deliverableId);
        const updated = await this.prisma.deliverable.update({
            where: { id: deliverableId },
            data: {
                status: constants_1.DELIVERABLE_STATUSES.REJECTED,
                revision_notes: dto.notes,
                reviewed_at: new Date(),
                auto_release_at: null,
            },
        });
        await this.notifications.create({
            userId: deliverable.creator.user_id,
            title: 'Deliverable Rejected',
            message: dto.notes
                ? `Your deliverable for ${deliverable.campaign.title} was rejected: ${dto.notes}`
                : `Your deliverable for ${deliverable.campaign.title} was rejected.`,
            type: 'SYSTEM',
            entityType: 'Deliverable',
            entityId: deliverable.id,
        });
        return this.formatDeliverable(updated);
    }
    async processAutoReleases() {
        const now = new Date();
        const staleDeliverables = await this.prisma.deliverable.findMany({
            where: {
                status: { in: [constants_1.DELIVERABLE_STATUSES.SUBMITTED, constants_1.DELIVERABLE_STATUSES.IN_REVIEW] },
                auto_release_at: { lte: now },
            },
            include: {
                campaign: { select: { title: true } },
                creator: { include: { user: true } },
            },
        });
        const processed = [];
        for (const deliverable of staleDeliverables) {
            const escrow = await this.escrowService.getEscrowForCampaignCreator(deliverable.campaign_id, deliverable.creator_id);
            if (!escrow || escrow.status !== constants_1.ESCROW_STATUSES.HELD)
                continue;
            try {
                await this.escrowService.releaseEscrowByCampaignCreator(deliverable.campaign_id, deliverable.creator_id, `Payment auto-released after ${constants_1.AUTO_RELEASE_DAYS} days without brand review.`);
                const systemAdmin = await this.prisma.user.findFirst({
                    where: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
                    select: { id: true },
                });
                if (systemAdmin) {
                    await this.prisma.auditLog.create({
                        data: {
                            admin_id: systemAdmin.id,
                            action: 'AUTO_RELEASE_ESCROW',
                            entity: 'Escrow',
                            entity_id: escrow.id,
                            metadata: {
                                deliverableId: deliverable.id,
                                campaignId: deliverable.campaign_id,
                                reason: '7-day auto-release',
                            },
                        },
                    });
                }
                processed.push(escrow.id);
            }
            catch {
            }
        }
        return { processed: processed.length, escrowIds: processed };
    }
    async tryReleaseEscrowAfterApproval(campaignId, creatorId) {
        const pending = await this.prisma.deliverable.count({
            where: {
                campaign_id: campaignId,
                creator_id: creatorId,
                status: {
                    notIn: [
                        constants_1.DELIVERABLE_STATUSES.APPROVED,
                        constants_1.DELIVERABLE_STATUSES.REJECTED,
                    ],
                },
            },
        });
        if (pending > 0)
            return;
        const escrow = await this.escrowService.getEscrowForCampaignCreator(campaignId, creatorId);
        if (!escrow || escrow.status !== constants_1.ESCROW_STATUSES.HELD)
            return;
        await this.escrowService.releaseEscrowByCampaignCreator(campaignId, creatorId, 'Payment released after deliverable approval.');
    }
    async assertEscrowHeld(campaignId, creatorId) {
        const escrow = await this.escrowService.getEscrowForCampaignCreator(campaignId, creatorId);
        if (!escrow) {
            throw new common_1.BadRequestException('No escrow exists for this campaign. Brand must deposit funds first.');
        }
        if (escrow.status !== constants_1.ESCROW_STATUSES.HELD) {
            throw new common_1.BadRequestException('Work cannot start until escrow status is HELD. Brand must deposit funds into escrow.');
        }
    }
    async getBrandOwnedDeliverable(userId, deliverableId) {
        const deliverable = await this.prisma.deliverable.findUnique({
            where: { id: deliverableId },
            include: {
                campaign: { include: { brand: true } },
                creator: { include: { user: true } },
            },
        });
        if (!deliverable)
            throw new common_1.NotFoundException('Deliverable not found');
        const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
        if (!brand || deliverable.campaign.brand_id !== brand.id) {
            throw new common_1.ForbiddenException('Only the brand can review deliverables');
        }
        return deliverable;
    }
    formatDeliverable(row) {
        return {
            id: row.id,
            campaignId: row.campaign_id,
            creatorId: row.creator_id,
            title: row.title,
            fileUrl: row.file_url ?? row.media_url,
            mediaUrl: row.media_url ?? row.file_url,
            thumbnailUrl: row.thumbnail_url,
            notes: row.notes,
            revisionNotes: row.revision_notes,
            version: row.version ?? 1,
            status: row.status,
            submittedAt: row.submitted_at?.toISOString?.() ?? row.submitted_at ?? null,
            reviewedAt: row.reviewed_at?.toISOString?.() ?? row.reviewed_at ?? null,
            autoReleaseAt: row.auto_release_at?.toISOString?.() ?? row.auto_release_at ?? null,
            createdAt: row.created_at?.toISOString?.() ?? row.created_at,
            updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
        };
    }
};
exports.DeliverablesService = DeliverablesService;
exports.DeliverablesService = DeliverablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        escrow_service_1.EscrowService,
        storage_service_1.StorageService])
], DeliverablesService);
//# sourceMappingURL=deliverables.service.js.map