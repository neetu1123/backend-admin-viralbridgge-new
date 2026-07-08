import { CreateEscrowPaymentOrderDto, VerifyEscrowPaymentDto } from './dto/payments.dto';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/wallet.dto';
import { EscrowPaymentService } from './escrow-payment.service';
import { RazorpayService } from './razorpay.service';
import { WalletService } from './wallet.service';
export declare class PaymentsController {
    private readonly walletService;
    private readonly razorpayService;
    private readonly escrowPaymentService;
    constructor(walletService: WalletService, razorpayService: RazorpayService, escrowPaymentService: EscrowPaymentService);
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
    verify(req: {
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
    createEscrowOrder(req: {
        user: {
            id: string;
        };
    }, body: CreateEscrowPaymentOrderDto): Promise<{
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
    verifyEscrow(req: {
        user: {
            id: string;
        };
    }, body: VerifyEscrowPaymentDto): Promise<{
        escrow: {
            campaign: {
                title: string;
            };
            creator: {
                user: {
                    name: string;
                    id: string;
                };
            } & {
                id: string;
                updated_at: Date;
                locality: string | null;
                languages: string[];
                created_at: Date;
                user_id: string;
                full_name: string | null;
                bio: string | null;
                niche: string | null;
                followers: number;
                engagement_rate: number;
                social_links: import("@prisma/client/runtime/library").JsonValue | null;
                media_kit: string | null;
                portfolio: string | null;
                contact_email: string | null;
                phone: string | null;
                photo: string | null;
            };
            brand: {
                user: {
                    name: string;
                    id: string;
                };
            } & {
                id: string;
                updated_at: Date;
                description: string | null;
                created_at: Date;
                user_id: string;
                contact_email: string | null;
                phone: string | null;
                company_name: string;
                industry: string | null;
                website: string | null;
                logo: string | null;
                location: string | null;
            };
        } & {
            id: string;
            campaign_id: string;
            creator_id: string;
            status: string;
            platform_fee_percent: number;
            updated_at: Date;
            brand_id: string;
            created_at: Date;
            platform_fee: number;
            amount: number;
            platform_fee_amount: number;
            creator_amount: number;
            payment_gateway: string | null;
            payment_id: string | null;
            locked_at: Date | null;
            funded_at: Date | null;
            released_at: Date | null;
            refunded_at: Date | null;
        };
        alreadyProcessed?: undefined;
    } | {
        escrow: {
            id: string;
            campaign_id: string;
            creator_id: string;
            status: string;
            platform_fee_percent: number;
            updated_at: Date;
            brand_id: string;
            created_at: Date;
            platform_fee: number;
            amount: number;
            platform_fee_amount: number;
            creator_amount: number;
            payment_gateway: string | null;
            payment_id: string | null;
            locked_at: Date | null;
            funded_at: Date | null;
            released_at: Date | null;
            refunded_at: Date | null;
        } | null;
        alreadyProcessed: boolean;
    }>;
    getRazorpayKey(): {
        keyId: string | null;
    };
}
