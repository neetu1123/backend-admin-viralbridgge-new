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
    }>;
    list(req: {
        user: {
            id: string;
        };
    }, query: WithdrawalQueryDto): Promise<{
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
}
