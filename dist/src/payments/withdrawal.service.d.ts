import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { RequestWithdrawalDto, WithdrawalQueryDto } from './dto/withdrawal.dto';
import { WalletService } from './wallet.service';
export declare class WithdrawalService {
    private readonly prisma;
    private readonly wallet;
    private readonly notifications;
    private readonly email;
    private readonly logger;
    constructor(prisma: PrismaService, wallet: WalletService, notifications: NotificationsService, email: EmailService);
    sendWithdrawOtp(userId: string): Promise<{
        sent: boolean;
        expiresAt: string;
    }>;
    private verifyWithdrawOtp;
    requestWithdrawal(userId: string, dto: RequestWithdrawalDto): Promise<{
        id: string;
        creatorId: string;
        amount: number;
        status: string;
        transactionId: string | null | undefined;
        requestedAt: string;
        approvedAt: string | null;
        rejectedAt: string | null;
        rejectionReason: string | null;
    }>;
    listUserWithdrawals(userId: string, query: WithdrawalQueryDto): Promise<{
        data: {
            id: string;
            creatorId: string;
            amount: number;
            status: string;
            transactionId: string | null | undefined;
            requestedAt: string;
            approvedAt: string | null;
            rejectedAt: string | null;
            rejectionReason: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    listAdminWithdrawals(status?: string): Promise<{
        creator: string;
        creatorEmail: string;
        id: string;
        creatorId: string;
        amount: number;
        status: string;
        transactionId: string | null | undefined;
        requestedAt: string;
        approvedAt: string | null;
        rejectedAt: string | null;
        rejectionReason: string | null;
    }[]>;
    approveWithdrawal(id: string, adminId?: string): Promise<{
        id: string;
        creatorId: string;
        amount: number;
        status: string;
        transactionId: string | null | undefined;
        requestedAt: string;
        approvedAt: string | null;
        rejectedAt: string | null;
        rejectionReason: string | null;
    }>;
    rejectWithdrawal(id: string, adminId?: string, reason?: string): Promise<{
        id: string;
        creatorId: string;
        amount: number;
        status: string;
        transactionId: string | null | undefined;
        requestedAt: string;
        approvedAt: string | null;
        rejectedAt: string | null;
        rejectionReason: string | null;
    }>;
    private getWithdrawalOrThrow;
    private formatWithdrawal;
}
