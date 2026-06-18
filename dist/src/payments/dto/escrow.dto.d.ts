export declare class CreateEscrowDto {
    campaign_id: string;
    creator_id: string;
    amount?: number;
}
export declare class EscrowIdDto {
    escrow_id: string;
}
export declare class EscrowActionDto extends EscrowIdDto {
    notes?: string;
}
export declare class EscrowRefundDto extends EscrowActionDto {
}
export declare class OpenDisputeDto {
    campaign_id: string;
    creator_id?: string;
    reason: string;
}
export declare class ResolveDisputeDto {
    notes?: string;
    creator_amount?: number;
    brand_amount?: number;
}
