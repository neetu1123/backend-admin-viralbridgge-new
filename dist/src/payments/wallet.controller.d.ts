import { AddFundsDto, CreatePaymentOrderDto, TransactionQueryDto, VerifyPaymentDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';
import { RazorpayService } from './razorpay.service';
export declare class WalletController {
    private readonly walletService;
    private readonly razorpayService;
    constructor(walletService: WalletService, razorpayService: RazorpayService);
    getWallet(req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    getTransactions(req: {
        user: {
            id: string;
        };
    }, query: TransactionQueryDto): Promise<{
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
    addFunds(req: {
        user: {
            id: string;
        };
    }, body: AddFundsDto): Promise<{
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
    createOrder(req: {
        user: {
            id: string;
        };
    }, body: CreatePaymentOrderDto): Promise<{
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
    verifyPayment(req: {
        user: {
            id: string;
        };
    }, body: VerifyPaymentDto): Promise<{
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
    getRazorpayKey(): {
        keyId: string | null;
    };
}
