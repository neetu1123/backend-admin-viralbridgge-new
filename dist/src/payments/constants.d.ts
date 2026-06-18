export declare const TRANSACTION_TYPES: {
    readonly ADD_FUNDS: "ADD_FUNDS";
    readonly ESCROW_LOCK: "ESCROW_LOCK";
    readonly ESCROW_RELEASE: "ESCROW_RELEASE";
    readonly WITHDRAWAL: "WITHDRAWAL";
    readonly REFUND: "REFUND";
    readonly PAYOUT: "PAYOUT";
    readonly DEPOSIT: "DEPOSIT";
    readonly ESCROW_HOLD: "ESCROW_HOLD";
    readonly ESCROW_REFUND: "ESCROW_REFUND";
};
export declare const TRANSACTION_STATUSES: {
    readonly PENDING: "PENDING";
    readonly COMPLETED: "COMPLETED";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
};
export declare const ESCROW_STATUSES: {
    readonly HELD: "HELD";
    readonly RELEASED: "RELEASED";
    readonly REFUNDED: "REFUNDED";
    readonly DISPUTED: "DISPUTED";
};
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
export declare const OPEN_DISPUTE_STATUSES: ("OPEN" | "IN_REVIEW" | "ESCALATED")[];
export declare const PAYMENT_ORDER_STATUSES: {
    readonly CREATED: "CREATED";
    readonly PAID: "PAID";
    readonly FAILED: "FAILED";
};
