export declare const TRANSACTION_TYPES: {
    readonly TOPUP: "TOPUP";
    readonly ADD_FUNDS: "ADD_FUNDS";
    readonly ESCROW_LOCK: "ESCROW_LOCK";
    readonly ESCROW_RELEASE: "ESCROW_RELEASE";
    readonly WITHDRAWAL: "WITHDRAWAL";
    readonly WITHDRAWAL_REQUEST: "WITHDRAWAL_REQUEST";
    readonly WITHDRAWAL_APPROVED: "WITHDRAWAL_APPROVED";
    readonly WITHDRAWAL_REJECTED: "WITHDRAWAL_REJECTED";
    readonly REFUND: "REFUND";
    readonly PLATFORM_FEE: "PLATFORM_FEE";
    readonly PAYOUT: "PAYOUT";
    readonly DEPOSIT: "DEPOSIT";
    readonly ESCROW_HOLD: "ESCROW_HOLD";
    readonly ESCROW_REFUND: "ESCROW_REFUND";
};
export declare const PAYMENT_ORDER_PURPOSES: {
    readonly WALLET_TOPUP: "WALLET_TOPUP";
    readonly ESCROW_FUND: "ESCROW_FUND";
};
export declare const TRANSACTION_STATUSES: {
    readonly PENDING: "PENDING";
    readonly COMPLETED: "COMPLETED";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
};
export declare const ESCROW_STATUSES: {
    readonly PENDING: "PENDING";
    readonly HELD: "HELD";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly REVIEW: "REVIEW";
    readonly RELEASED: "RELEASED";
    readonly REFUNDED: "REFUNDED";
    readonly DISPUTED: "DISPUTED";
};
export declare const DELIVERABLE_STATUSES: {
    readonly PENDING: "PENDING";
    readonly SUBMITTED: "SUBMITTED";
    readonly IN_REVIEW: "IN_REVIEW";
    readonly REVISION_REQUESTED: "REVISION_REQUESTED";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
};
export declare const AUTO_RELEASE_DAYS = 7;
export declare const PLATFORM_FEE_PERCENT: number;
export declare const DISPUTE_STATUSES: {
    readonly OPEN: "OPEN";
    readonly IN_REVIEW: "IN_REVIEW";
    readonly RESOLVED: "RESOLVED";
    readonly REFUNDED: "REFUNDED";
    readonly ESCALATED: "ESCALATED";
};
export declare const WITHDRAWAL_STATUSES: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly COMPLETED: "COMPLETED";
};
export declare const OPEN_DISPUTE_STATUSES: ("IN_REVIEW" | "OPEN" | "ESCALATED")[];
export declare const PAYMENT_ORDER_STATUSES: {
    readonly CREATED: "CREATED";
    readonly PAID: "PAID";
    readonly FAILED: "FAILED";
};
