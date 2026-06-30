import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DeliverablesService } from '../payments/deliverables.service';
export declare const ESCROW_AUTO_RELEASE_QUEUE = "escrow-auto-release";
export declare class EscrowAutoReleaseProcessor extends WorkerHost {
    private readonly deliverablesService;
    private readonly logger;
    constructor(deliverablesService: DeliverablesService);
    process(job: Job): Promise<{
        processed: number;
        escrowIds: string[];
    } | undefined>;
}
