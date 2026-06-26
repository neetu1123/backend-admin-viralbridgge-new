import { RequestWithdrawalDto, WithdrawalQueryDto } from './dto/withdrawal.dto';
import { WithdrawalService } from './withdrawal.service';
export declare class WithdrawalController {
    private readonly withdrawalService;
    constructor(withdrawalService: WithdrawalService);
    request(req: {
        user: {
            id: string;
        };
    }, body: RequestWithdrawalDto): Promise<{
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
    list(req: {
        user: {
            id: string;
        };
    }, query: WithdrawalQueryDto): Promise<{
        data: {
            id: string;
            creatorId: string;
            amount: number;
            status: string;
            transactionId: string | null | undefined;
            requestedAt: string;
            approvedAt: string | null;
            rejectedAt: string | null;
            rejectionReason: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
