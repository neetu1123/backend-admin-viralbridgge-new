import { PrismaService } from '../prisma/prisma.service';
export type ActivityField = 'last_login' | 'last_active' | 'last_campaign_activity' | 'last_wallet_activity' | 'last_message_activity';
export declare class UserActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    private now;
    touch(userId: string, fields: ActivityField | ActivityField[]): Promise<void>;
    recordLogin(userId: string): Promise<void>;
    recordActive(userId: string): Promise<void>;
    recordCampaignActivity(userId: string): Promise<void>;
    recordWalletActivity(userId: string): Promise<void>;
    recordMessageActivity(userId: string): Promise<void>;
    getActivity(userId: string): Promise<{
        id: string;
        updated_at: Date;
        user_id: string;
        last_active: Date | null;
        last_login: Date | null;
        last_campaign_activity: Date | null;
        last_wallet_activity: Date | null;
        last_message_activity: Date | null;
    } | null>;
    getOrCreate(userId: string): Promise<{
        id: string;
        updated_at: Date;
        user_id: string;
        last_active: Date | null;
        last_login: Date | null;
        last_campaign_activity: Date | null;
        last_wallet_activity: Date | null;
        last_message_activity: Date | null;
    }>;
}
