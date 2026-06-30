import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type TxClient = Prisma.TransactionClient;
export declare class PlatformWalletService {
    private readonly prisma;
    private platformUserId;
    constructor(prisma: PrismaService);
    getPlatformWallet(tx?: TxClient): Promise<{
        id: string;
        updated_at: Date;
        created_at: Date;
        user_id: string;
        available_balance: number;
        locked_balance: number;
        pending_balance: number;
        lifetime_earnings: number;
        currency: string;
        is_platform: boolean;
        is_frozen: boolean;
    }>;
    creditPlatformFee(tx: TxClient, amount: number, referenceId?: string): Promise<{
        id: string;
        updated_at: Date;
        created_at: Date;
        user_id: string;
        available_balance: number;
        locked_balance: number;
        pending_balance: number;
        lifetime_earnings: number;
        currency: string;
        is_platform: boolean;
        is_frozen: boolean;
    } | null>;
    private ensurePlatformUser;
}
export {};
