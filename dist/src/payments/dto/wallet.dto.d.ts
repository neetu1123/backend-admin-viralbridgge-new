import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class AddFundsDto {
    amount: number;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}
export declare class CreatePaymentOrderDto {
    amount: number;
}
export declare class TransactionQueryDto extends PaginationQueryDto {
    type?: string;
    status?: string;
}
export declare class VerifyPaymentDto {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
