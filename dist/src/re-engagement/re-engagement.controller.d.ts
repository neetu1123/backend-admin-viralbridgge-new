import { ReEngagementService } from './re-engagement.service';
export declare class ReEngagementController {
    private readonly reEngagement;
    constructor(reEngagement: ReEngagementService);
    getAnalytics(): Promise<{
        emailsSent: number;
        emailsOpened: number;
        usersReturned: number;
        openRate: number;
        returnRate: number;
    }>;
    runJob(): Promise<{
        processed: number;
        sent: number;
    }>;
}
