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
    formatWallet(wallet: {
        id: string;
        user_id: string;
        available_balance: number;
        locked_balance: number;
        pending_balance: number;
        lifetime_earnings: number;
        currency: string;
        is_frozen: boolean;
        created_at: Date;
        updated_at: Date;
    }): {
        id: string;
        userId: string;
        available_balance: number;
        locked_balance: number;
        pending_balance: number;
        lifetime_earnings: number;
        currency: string;
        is_frozen: boolean;
        createdAt: string;
        updatedAt: string;
    };
    ensureWallet(userId: string, tx?: TxClient): Promise<{
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
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        available_balance: number;
        locked_balance: number;
        pending_balance: number;
        lifetime_earnings: number;
        currency: string;
        is_frozen: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    assertWalletActive(wallet: {
        is_frozen: boolean;
    }): void;
    getTransactions(userId: string, query: TransactionQueryDto): Promise<{
        data: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
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
        purpose: string;
        escrowId: string | null;
        mock: boolean;
    } | {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string | undefined;
        paymentOrderId: string;
        purpose: string;
        escrowId: string | null;
        mock: boolean;
    }>;
    addFunds(userId: string, dto: AddFundsDto): Promise<{
        wallet: {
            id: string;
            userId: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_frozen: boolean;
            createdAt: string;
            updatedAt: string;
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        };
    } | {
        wallet: {
            id: string;
            userId: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_frozen: boolean;
            createdAt: string;
            updatedAt: string;
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
            userId: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_frozen: boolean;
            createdAt: string;
            updatedAt: string;
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        };
    } | {
        wallet: {
            id: string;
            userId: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_frozen: boolean;
            createdAt: string;
            updatedAt: string;
        };
        alreadyProcessed: boolean;
    }>;
    creditWallet(userId: string, amount: number, type: string, referenceId?: string): Promise<{
        wallet: {
            id: string;
            userId: string;
            available_balance: number;
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_frozen: boolean;
            createdAt: string;
            updatedAt: string;
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        };
    }>;
    creditWalletInternal(tx: TxClient, userId: string, amount: number, type: string, referenceType?: string, referenceId?: string): Promise<{
        wallet: {
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
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        };
    }>;
    creditCreatorPayout(tx: TxClient, userId: string, amount: number, referenceId?: string): Promise<{
        wallet: {
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
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        };
    }>;
    debitAvailable(tx: TxClient, userId: string, amount: number, type: string, referenceType?: string, referenceId?: string, status?: "COMPLETED"): Promise<{
        wallet: {
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
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
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
            locked_balance: number;
            pending_balance: number;
            lifetime_earnings: number;
            currency: string;
            is_platform: boolean;
            is_frozen: boolean;
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        };
    }>;
    lockEscrowFromGateway(tx: TxClient, userId: string, amount: number, referenceId?: string, paymentId?: string): Promise<{
        wallet: {
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
        };
        transaction: {
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            type: string;
            wallet_id: string;
            amount: number;
            balance_after: number | null;
            reference_type: string | null;
            reference_id: string | null;
        };
        paymentId: string | undefined;
    }>;
    releaseLocked(tx: TxClient, userId: string, amount: number, referenceId?: string): Promise<{
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
    refundLockedToAvailable(tx: TxClient, userId: string, amount: number, referenceId?: string): Promise<{
        wallet: {
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
        };
    }>;
    releasePending(tx: TxClient, userId: string, amount: number): Promise<{
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
    refundPendingToAvailable(tx: TxClient, userId: string, amount: number, referenceId?: string): Promise<{
        wallet: {
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
        };
    }>;
}
export {};
