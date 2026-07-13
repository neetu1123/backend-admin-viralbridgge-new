import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { MatchingService } from '../matching/matching.service';
import { UserActivityService } from '../user-activity/user-activity.service';
export declare class ReEngagementService implements OnModuleInit {
    private prisma;
    private email;
    private matching;
    private userActivity;
    private readonly logger;
    private intervalRef;
    constructor(prisma: PrismaService, email: EmailService, matching: MatchingService, userActivity: UserActivityService);
    onModuleInit(): void;
    getSettings(): Promise<{
        enabled: boolean;
        inactivePeriod: string;
        emailFrequencyDays: number;
    }>;
    getAnalytics(): Promise<{
        emailsSent: number;
        emailsOpened: number;
        usersReturned: number;
        openRate: number;
        returnRate: number;
    }>;
    processInactiveUsers(): Promise<{
        processed: number;
        sent: number;
    }>;
    private sendReEngagementEmail;
    markUserReturned(userId: string): Promise<void>;
}
