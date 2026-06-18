import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AddFundsDto, TransactionQueryDto } from './dto/wallet.dto';
import { RazorpayService } from './razorpay.service';
type TxClient = Prisma.TransactionClient;
export declare class WalletService {
    private readonly prisma;
    private readonly notifications;
    private readonly razorpay;
    constructor(prisma: PrismaService, notifications: NotificationsService, razorpay: RazorpayService);
    ensureWallet(userId: string, tx?: TxClient): Promise<{
        id: string;
        updated_at: Date;
        created_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        updated_at: Date;
        created_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
    }>;
    getTransactions(userId: string, query: TransactionQueryDto): Promise<{
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
    createPaymentOrder(userId: string, amount: number): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: null;
        paymentOrderId: string;
        mock: boolean;
    } | {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string | undefined;
        paymentOrderId: string;
        mock: boolean;
    }>;
    addFunds(userId: string, dto: AddFundsDto): Promise<{
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
    } | {
        wallet: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
        alreadyProcessed: boolean;
    }>;
    verifyAndCredit(userId: string, dto: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{
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
    } | {
        wallet: {
            id: string;
            updated_at: Date;
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
        alreadyProcessed: boolean;
    }>;
    creditWallet(userId: string, amount: number, type: string, referenceId?: string): Promise<{
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
    creditWalletInternal(tx: TxClient, userId: string, amount: number, type: string, referenceId?: string): Promise<{
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
    debitAvailable(tx: TxClient, userId: string, amount: number, type: string, referenceId?: string, status?: "COMPLETED"): Promise<{
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
    moveToPending(tx: TxClient, userId: string, amount: number, referenceId?: string): Promise<{
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
    releasePending(tx: TxClient, userId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        created_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
    }>;
    refundPendingToAvailable(tx: TxClient, userId: string, amount: number, referenceId?: string): Promise<{
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
}
export {};
