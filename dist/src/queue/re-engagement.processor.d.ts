import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReEngagementService } from '../re-engagement/re-engagement.service';
export declare const RE_ENGAGEMENT_QUEUE = "re-engagement";
export declare class ReEngagementProcessor extends WorkerHost {
    private readonly reEngagement;
    private readonly logger;
    constructor(reEngagement: ReEngagementService);
    process(job: Job): Promise<{
        processed: number;
        sent: number;
    } | undefined>;
}
