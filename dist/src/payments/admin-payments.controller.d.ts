import { ResolveDisputeDto } from './dto/escrow.dto';
import { DisputeQueryDto, RejectWithdrawalDto } from './dto/withdrawal.dto';
import { DisputeService } from './dispute.service';
import { WithdrawalService } from './withdrawal.service';
export declare class AdminPaymentsController {
    private readonly withdrawalService;
    private readonly disputeService;
    constructor(withdrawalService: WithdrawalService, disputeService: DisputeService);
    getWithdrawals(status?: string): Promise<({
        wallet: {
            user: {
                role: {
                    name: string;
                    id: string;
                    description: string | null;
                } | null;
            } & {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    })[]>;
    approveWithdrawal(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
    approveWithdrawalPatch(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
    rejectWithdrawal(id: string, body: RejectWithdrawalDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
    rejectWithdrawalPatch(id: string, body: RejectWithdrawalDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        wallet: {
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
            created_at: Date;
            user_id: string;
            available_balance: number;
            pending_balance: number;
        };
    } & {
        id: string;
        status: string;
        updated_at: Date;
        created_at: Date;
        type: string;
        wallet_id: string;
        amount: number;
        reference_id: string | null;
    }>;
    getDisputeStats(): Promise<{
        openCount: number;
        totalAtStake: number;
        resolvedCount: number;
    }>;
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
