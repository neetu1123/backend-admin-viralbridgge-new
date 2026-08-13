import { AdminAssignDto, AdminCaseQueryDto, AdminNoteDto, AdminUpdateCaseDto, SendMessageDto } from './support.dto';
import { SupportService } from './support.service';
export declare class AdminSupportController {
    private readonly support;
    constructor(support: SupportService);
    getSummary(): Promise<{
        openCases: number;
        highPriority: number;
        unassigned: number;
        waitingForUser: number;
        resolvedToday: number;
    }>;
    getCases(query: AdminCaseQueryDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        data: {
            id: string;
            caseNumber: string;
            userId: string;
            userRole: string;
            userName: string;
            userEmail: string;
            categoryId: string | null;
            subcategoryId: string | null;
            issueId: string | null;
            caseType: string;
            priority: string;
            status: string;
            subject: string;
            description: string;
            campaignId: string | null;
            paymentId: string | null;
            transactionId: string | null;
            contextJson: unknown;
            assignedAdminId: string | undefined;
            assignedAdminName: string | undefined;
            createdAt: string;
            updatedAt: string;
            resolvedAt: string | undefined;
            messages: {
                id: string;
                senderId: string;
                senderRole: string;
                message: string;
                createdAt: string;
                readAt: string | undefined;
            }[] | undefined;
            attachments: {
                id: string;
                fileName: string;
                fileUrl: string;
                mimeType: string | null;
                createdAt: string;
            }[];
            notes: {
                id: string;
                note: string;
                adminName: string;
                createdAt: string;
            }[] | undefined;
            events: {
                id: string;
                eventType: string;
                oldValue: string | null;
                newValue: string | null;
                createdAt: string;
            }[] | undefined;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCase(caseId: string): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
    updateCase(caseId: string, body: AdminUpdateCaseDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
    assign(caseId: string, body: AdminAssignDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
    reply(caseId: string, body: SendMessageDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
    addNote(caseId: string, body: AdminNoteDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
    resolve(caseId: string, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
    close(caseId: string, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
    reopen(caseId: string, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        caseNumber: string;
        userId: string;
        userRole: string;
        userName: string;
        userEmail: string;
        categoryId: string | null;
        subcategoryId: string | null;
        issueId: string | null;
        caseType: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        campaignId: string | null;
        paymentId: string | null;
        transactionId: string | null;
        contextJson: unknown;
        assignedAdminId: string | undefined;
        assignedAdminName: string | undefined;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        messages: {
            id: string;
            senderId: string;
            senderRole: string;
            message: string;
            createdAt: string;
            readAt: string | undefined;
        }[] | undefined;
        attachments: {
            id: string;
            fileName: string;
            fileUrl: string;
            mimeType: string | null;
            createdAt: string;
        }[];
        notes: {
            id: string;
            note: string;
            adminName: string;
            createdAt: string;
        }[] | undefined;
        events: {
            id: string;
            eventType: string;
            oldValue: string | null;
            newValue: string | null;
            createdAt: string;
        }[] | undefined;
    }>;
}
