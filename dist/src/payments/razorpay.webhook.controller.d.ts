import { WalletService } from './wallet.service';
import { RazorpayService } from './razorpay.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class RazorpayWebhookController {
    private readonly razorpay;
    private readonly wallet;
    private readonly prisma;
    constructor(razorpay: RazorpayService, wallet: WalletService, prisma: PrismaService);
    handleWebhook(req: {
        rawBody?: Buffer;
        body?: Record<string, unknown>;
    }, signature: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
