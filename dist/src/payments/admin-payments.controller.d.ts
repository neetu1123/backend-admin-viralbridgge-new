import { ResolveDisputeDto } from './dto/escrow.dto';
import { DisputeQueryDto, RejectWithdrawalDto } from './dto/withdrawal.dto';
import { DisputeService } from './dispute.service';
import { EscrowService } from './escrow.service';
import { WithdrawalService } from './withdrawal.service';
export declare class AdminPaymentsController {
    private readonly withdrawalService;
    private readonly disputeService;
    private readonly escrowService;
    constructor(withdrawalService: WithdrawalService, disputeService: DisputeService, escrowService: EscrowService);
    getWithdrawals(status?: string): Promise<{
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
    approveWithdrawal(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    approveWithdrawalPatch(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    rejectWithdrawal(id: string, body: RejectWithdrawalDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    rejectWithdrawalPatch(id: string, body: RejectWithdrawalDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    getDisputeStats(): Promise<{
        openCount: number;
        totalAtStake: number;
        resolvedCount: number;
    }>;
    getEscrows(status?: string): Promise<{
        id: unknown;
        campaignId: unknown;
        campaignTitle: string | undefined;
        brandId: unknown;
        creatorId: unknown;
        amount: unknown;
        platformFee: {};
        creatorPayout: number;
        status: unknown;
        lockedAt: {} | null;
        createdAt: string;
        releasedAt: {} | null;
    }[]>;
    getDisputes(query: DisputeQueryDto): Promise<{
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
    getDispute(id: string): Promise<{
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
    resolveDispute(id: string, body: ResolveDisputeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    resolveDisputePatch(id: string, body: ResolveDisputeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    refundDispute(id: string, body: ResolveDisputeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    refundDisputePatch(id: string, body: ResolveDisputeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    escalateDispute(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    partialPayout(id: string, body: ResolveDisputeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
}
