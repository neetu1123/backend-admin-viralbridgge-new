import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestWithdrawalDto, WithdrawalQueryDto } from './dto/withdrawal.dto';
import { WalletService } from './wallet.service';
export declare class WithdrawalService {
    private readonly prisma;
    private readonly wallet;
    private readonly notifications;
    constructor(prisma: PrismaService, wallet: WalletService, notifications: NotificationsService);
    requestWithdrawal(userId: string, dto: RequestWithdrawalDto): Promise<{
        wallet: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            reference_id: string | null;
        };
    }>;
    listUserWithdrawals(userId: string, query: WithdrawalQueryDto): Promise<{
        data: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            reference_id: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    listAdminWithdrawals(status?: string): Promise<({
        wallet: {
            user: {
                role: {
                    name: string;
                    id: string;
                    description: string | null;
                } | null;
            } & {
                name: string;
                id: string;
                status: string;
                updated_at: Date;
                created_at: Date;
                firebase_uid: string | null;
                password: string | null;
                email: string;
                avatar: string | null;
                role_id: string | null;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    })[]>;
    approveWithdrawal(id: string, adminId?: string): Promise<{
        wallet: {
            user: {
                name: string;
                id: string;
                status: string;
                updated_at: Date;
                created_at: Date;
                firebase_uid: string | null;
                password: string | null;
                email: string;
                avatar: string | null;
                role_id: string | null;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
    rejectWithdrawal(id: string, adminId?: string, reason?: string): Promise<{
        wallet: {
            user: {
                name: string;
                id: string;
                status: string;
                updated_at: Date;
                created_at: Date;
                firebase_uid: string | null;
                password: string | null;
                email: string;
                avatar: string | null;
                role_id: string | null;
                is_verified: boolean;
                is_banned: boolean;
                is_deleted: boolean;
                settings: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
    private getWithdrawalOrThrow;
}
