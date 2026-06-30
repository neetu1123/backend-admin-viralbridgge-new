import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { emitWalletEvent } from '../common/wallet-event-emitter';
import {
  AUTO_RELEASE_DAYS,
  DELIVERABLE_STATUSES,
  ESCROW_STATUSES,
} from './constants';
import {
  DeliverableRejectDto,
  DeliverableRevisionDto,
  SubmitDeliverableDto,
} from './dto/deliverables.dto';
import { EscrowService } from './escrow.service';
import { StorageService, UploadedFilePayload } from '../storage/storage.service';

@Injectable()
export class DeliverablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly escrowService: EscrowService,
    private readonly storage: StorageService,
  ) {}

  async uploadMedia(
    userId: string,
    file: UploadedFilePayload,
    options?: { campaignId?: string; thumbnail?: UploadedFilePayload },
  ) {
    await this.ensureCreatorProfile(userId);
    return this.storage.uploadDeliverable({
      userId,
      file,
      thumbnail: options?.thumbnail,
      campaignId: options?.campaignId,
    });
  }

  async submitWithUpload(
    userId: string,
    deliverableId: string,
    file: UploadedFilePayload,
    notes?: string,
    thumbnail?: UploadedFilePayload,
  ) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      select: { campaign_id: true },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');

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

  private async ensureCreatorProfile(userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new ForbiddenException('Creator profile required');
    return profile;
  }

  async submit(userId: string, dto: SubmitDeliverableDto) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });
    if (!profile) throw new ForbiddenException('Creator profile required');

    const deliverableId = dto.deliverable_id;

    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: { campaign: { include: { brand: { include: { user: true } } } } },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');
    if (deliverable.creator_id !== profile.id) throw new ForbiddenException('Forbidden');

    await this.assertEscrowHeld(deliverable.campaign_id, deliverable.creator_id);

    const fileUrl = dto.file_url || dto.mediaUrl;
    if (!fileUrl) throw new BadRequestException('file_url is required');

    const now = new Date();
    const autoReleaseAt = new Date(now);
    autoReleaseAt.setDate(autoReleaseAt.getDate() + AUTO_RELEASE_DAYS);

    const isResubmission =
      deliverable.status === DELIVERABLE_STATUSES.REVISION_REQUESTED ||
      deliverable.status === DELIVERABLE_STATUSES.REJECTED;

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        file_url: fileUrl,
        media_url: fileUrl,
        thumbnail_url: dto.thumbnailUrl,
        notes: dto.notes,
        title: dto.title ?? deliverable.title,
        status: DELIVERABLE_STATUSES.SUBMITTED,
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
      metadata: { campaignId: deliverable.campaign_id, status: DELIVERABLE_STATUSES.SUBMITTED },
    });

    emitWalletEvent(deliverable.campaign.brand.user_id, 'deliverable:submitted', updated);

    return this.formatDeliverable(updated);
  }

  async listByCampaign(userId: string, campaignId: string, roleName?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

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
      if (!isBrand && !isCreator) throw new ForbiddenException('Access denied');
    }

    const deliverables = await this.prisma.deliverable.findMany({
      where: { campaign_id: campaignId },
      include: { creator: { include: { user: true } }, application: true },
      orderBy: { created_at: 'desc' },
    });

    return deliverables.map((d) => this.formatDeliverable(d));
  }

  async approve(userId: string, deliverableId: string) {
    const deliverable = await this.getBrandOwnedDeliverable(userId, deliverableId);

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: DELIVERABLE_STATUSES.APPROVED,
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

  async requestRevision(userId: string, deliverableId: string, dto: DeliverableRevisionDto) {
    const deliverable = await this.getBrandOwnedDeliverable(userId, deliverableId);

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: DELIVERABLE_STATUSES.REVISION_REQUESTED,
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

    emitWalletEvent(deliverable.creator.user_id, 'deliverable:revision_requested', updated);

    return this.formatDeliverable(updated);
  }

  async reject(userId: string, deliverableId: string, dto: DeliverableRejectDto) {
    const deliverable = await this.getBrandOwnedDeliverable(userId, deliverableId);

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: DELIVERABLE_STATUSES.REJECTED,
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
        status: { in: [DELIVERABLE_STATUSES.SUBMITTED, DELIVERABLE_STATUSES.IN_REVIEW] },
        auto_release_at: { lte: now },
      },
      include: {
        campaign: { select: { title: true } },
        creator: { include: { user: true } },
      },
    });

    const processed: string[] = [];

    for (const deliverable of staleDeliverables) {
      const escrow = await this.escrowService.getEscrowForCampaignCreator(
        deliverable.campaign_id,
        deliverable.creator_id,
      );
      if (!escrow || escrow.status !== ESCROW_STATUSES.HELD) continue;

      try {
        await this.escrowService.releaseEscrowByCampaignCreator(
          deliverable.campaign_id,
          deliverable.creator_id,
          `Payment auto-released after ${AUTO_RELEASE_DAYS} days without brand review.`,
        );

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
      } catch {
        // Skip if already released or in invalid state
      }
    }

    return { processed: processed.length, escrowIds: processed };
  }

  private async tryReleaseEscrowAfterApproval(campaignId: string, creatorId: string) {
    const pending = await this.prisma.deliverable.count({
      where: {
        campaign_id: campaignId,
        creator_id: creatorId,
        status: {
          notIn: [
            DELIVERABLE_STATUSES.APPROVED,
            DELIVERABLE_STATUSES.REJECTED,
          ],
        },
      },
    });

    if (pending > 0) return;

    const escrow = await this.escrowService.getEscrowForCampaignCreator(campaignId, creatorId);
    if (!escrow || escrow.status !== ESCROW_STATUSES.HELD) return;

    await this.escrowService.releaseEscrowByCampaignCreator(
      campaignId,
      creatorId,
      'Payment released after deliverable approval.',
    );
  }

  private async assertEscrowHeld(campaignId: string, creatorId: string) {
    const escrow = await this.escrowService.getEscrowForCampaignCreator(campaignId, creatorId);
    if (!escrow) {
      throw new BadRequestException('No escrow exists for this campaign. Brand must deposit funds first.');
    }
    if (escrow.status !== ESCROW_STATUSES.HELD) {
      throw new BadRequestException(
        'Work cannot start until escrow status is HELD. Brand must deposit funds into escrow.',
      );
    }
  }

  private async getBrandOwnedDeliverable(userId: string, deliverableId: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: {
        campaign: { include: { brand: true } },
        creator: { include: { user: true } },
      },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');

    const brand = await this.prisma.brandProfile.findUnique({ where: { user_id: userId } });
    if (!brand || deliverable.campaign.brand_id !== brand.id) {
      throw new ForbiddenException('Only the brand can review deliverables');
    }

    return deliverable;
  }

  formatDeliverable(row: {
    id: string;
    campaign_id: string;
    creator_id: string;
    title: string;
    file_url?: string | null;
    media_url?: string | null;
    thumbnail_url?: string | null;
    notes?: string | null;
    revision_notes?: string | null;
    version?: number;
    status: string;
    submitted_at?: Date | null;
    reviewed_at?: Date | null;
    auto_release_at?: Date | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
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
}
