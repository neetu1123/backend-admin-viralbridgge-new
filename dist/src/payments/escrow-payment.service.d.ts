import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EscrowService } from './escrow.service';
import { PlatformWalletService } from './platform-wallet.service';
import { RazorpayService } from './razorpay.service';
import { WalletService } from './wallet.service';
export declare class EscrowPaymentService {
    private readonly prisma;
    private readonly razorpay;
    private readonly wallet;
    private readonly notifications;
    private readonly escrowService;
    private readonly platformWallet;
    constructor(prisma: PrismaService, razorpay: RazorpayService, wallet: WalletService, notifications: NotificationsService, escrowService: EscrowService, platformWallet: PlatformWalletService);
    createEscrowPaymentOrder(userId: string, escrowId: string): Promise<{
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
    verifyEscrowPayment(userId: string, dto: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{
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
            updated_at: Date;
            brand_id: string;
            created_at: Date;
            platform_fee: number;
            amount: number;
            platform_fee_percent: number;
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
            updated_at: Date;
            brand_id: string;
            created_at: Date;
            platform_fee: number;
            amount: number;
            platform_fee_percent: number;
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
    fundEscrowFromWebhook(orderId: string, paymentId: string): Promise<{
        escrow: {
            campaign: {
                title: string;
            };
            creator: {
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
            updated_at: Date;
            brand_id: string;
            created_at: Date;
            platform_fee: number;
            amount: number;
            platform_fee_percent: number;
            platform_fee_amount: number;
            creator_amount: number;
            payment_gateway: string | null;
            payment_id: string | null;
            locked_at: Date | null;
            funded_at: Date | null;
            released_at: Date | null;
            refunded_at: Date | null;
        };
        alreadyProcessed: boolean;
    } | {
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
            updated_at: Date;
            brand_id: string;
            created_at: Date;
            platform_fee: number;
            amount: number;
            platform_fee_percent: number;
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
    } | null>;
    private fundEscrowFromPayment;
}
