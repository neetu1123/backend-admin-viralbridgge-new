import { DeliverablesService } from './deliverables.service';
import { DeliverableRejectDto, DeliverableRevisionDto, SubmitDeliverableDto } from './dto/deliverables.dto';
export declare class DeliverablesController {
    private readonly deliverablesService;
    constructor(deliverablesService: DeliverablesService);
    upload(req: {
        user: {
            id: string;
        };
    }, files: {
        file?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
    }, body: {
        campaign_id?: string;
    }): Promise<import("../storage/storage.service").UploadResult>;
    submitFile(req: {
        user: {
            id: string;
        };
    }, files: {
        file?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
    }, body: {
        deliverable_id: string;
        notes?: string;
    }): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }>;
    submit(req: {
        user: {
            id: string;
        };
    }, body: SubmitDeliverableDto): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }>;
    list(req: {
        user: {
            id: string;
            role?: {
                name: string;
            };
        };
    }, campaignId: string): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }[]>;
    requestRevision(req: {
        user: {
            id: string;
        };
    }, id: string, body: DeliverableRevisionDto): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }>;
    approve(req: {
        user: {
            id: string;
        };
    }, id: string): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }>;
    reject(req: {
        user: {
            id: string;
        };
    }, id: string, body: DeliverableRejectDto): Promise<{
        id: string;
        campaignId: string;
        creatorId: string;
        title: string;
        fileUrl: string | null | undefined;
        mediaUrl: string | null | undefined;
        thumbnailUrl: string | null | undefined;
        notes: string | null | undefined;
        revisionNotes: string | null | undefined;
        version: number;
        status: string;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
        autoReleaseAt: string | Date | null;
        createdAt: string | Date | undefined;
        updatedAt: string | Date | undefined;
    }>;
}
