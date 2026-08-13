export declare class CreateSupportCaseDto {
    categoryId?: string;
    subcategoryId?: string;
    issueId?: string;
    subject: string;
    description: string;
    caseType?: string;
    priority?: string;
    campaignId?: string;
    paymentId?: string;
    transactionId?: string;
    contextJson?: Record<string, unknown>;
}
export declare class ResolveSupportDto {
    issueId: string;
    campaignId?: string;
    paymentId?: string;
}
export declare class SendMessageDto {
    message: string;
}
export declare class AdminUpdateCaseDto {
    status?: string;
    priority?: string;
    assignedAdminId?: string;
}
export declare class AdminAssignDto {
    adminId: string;
}
export declare class AdminNoteDto {
    note: string;
}
export declare class AdminCaseQueryDto {
    status?: string;
    priority?: string;
    caseType?: string;
    assignedAdminId?: string;
    search?: string;
    tab?: string;
    page?: string;
    limit?: string;
}
export declare class SearchQueryDto {
    q: string;
}
