import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class RequestWithdrawalDto {
    amount: number;
    notes?: string;
    otp?: string;
}
export declare class RejectWithdrawalDto {
    reason?: string;
}
export declare class WithdrawalQueryDto extends PaginationQueryDto {
    status?: string;
}
export declare class DisputeQueryDto extends PaginationQueryDto {
    status?: string;
    priority?: string;
    raised_by?: string;
}
