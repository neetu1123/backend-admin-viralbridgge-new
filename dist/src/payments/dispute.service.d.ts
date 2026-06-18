import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ResolveDisputeDto } from './dto/escrow.dto';
import { DisputeQueryDto } from './dto/withdrawal.dto';
import { EscrowService } from './escrow.service';
import { WalletService } from './wallet.service';
export declare class DisputeService {
    private readonly prisma;
    private readonly wallet;
    private readonly escrow;
    private readonly notifications;
    constructor(prisma: PrismaService, wallet: WalletService, escrow: EscrowService, notifications: NotificationsService);
    listAdminDisputes(query?: Partial<DisputeQueryDto>): Promise<{
        data: {
            amount: number;
            priority: "high" | "medium" | "low";
            id: string;
            campaignId: string;
            campaignTitle: string;
            creator: string;
            brand: string;
            reason: string;
            raisedBy: string;
            status: string;
            openedAt: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAdminDisputeStats(): Promise<{
        openCount: number;
        totalAtStake: number;
        resolvedCount: number;
    }>;
    getAdminDispute(id: string): Promise<{
        amount: number;
        priority: "high" | "medium" | "low";
        id: string;
        campaignId: string;
        campaignTitle: string;
        creator: string;
        brand: string;
        reason: string;
        raisedBy: string;
        status: string;
        openedAt: string;
    }>;
    resolveDispute(id: string, adminId: string, dto: ResolveDisputeDto): Promise<{
        amount: number;
        priority: "high" | "medium" | "low";
        id: string;
        campaignId: string;
        campaignTitle: string;
        creator: string;
        brand: string;
        reason: string;
        raisedBy: string;
        status: string;
        openedAt: string;
    }>;
    refundDispute(id: string, adminId: string, notes?: string): Promise<{
        amount: number;
        priority: "high" | "medium" | "low";
        id: string;
        campaignId: string;
        campaignTitle: string;
        creator: string;
        brand: string;
        reason: string;
        raisedBy: string;
        status: string;
        openedAt: string;
    }>;
    escalateDispute(id: string, adminId: string): Promise<{
        amount: number;
        priority: "high" | "medium" | "low";
        id: string;
        campaignId: string;
        campaignTitle: string;
        creator: string;
        brand: string;
        reason: string;
        raisedBy: string;
        status: string;
        openedAt: string;
    }>;
    private partialResolveDispute;
    private settleDispute;
    listUserDisputes(userId: string, role: 'brand' | 'creator'): Promise<{
        amount: number;
        priority: "high" | "medium" | "low";
        id: string;
        campaignId: string;
        campaignTitle: string;
        creator: string;
        brand: string;
        reason: string;
        raisedBy: string;
        status: string;
        openedAt: string;
    }[]>;
    private getDisputeOrThrow;
    private findEscrow;
    private formatDisputeRow;
    private writeAudit;
}
