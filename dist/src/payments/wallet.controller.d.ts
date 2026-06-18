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
        updated_at: Date;
        created_at: Date;
        user_id: string;
        available_balance: number;
        pending_balance: number;
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
        mock: boolean;
    } | {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string | undefined;
        paymentOrderId: string;
        mock: boolean;
    }>;
    verifyPayment(req: {
        user: {
            id: string;
        };
    }, body: VerifyPaymentDto): Promise<{
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
    getRazorpayKey(): {
        keyId: string | null;
    };
}
