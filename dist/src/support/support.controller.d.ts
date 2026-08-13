import { CreateSupportCaseDto, ResolveSupportDto, SearchQueryDto, SendMessageDto } from './support.dto';
import { SupportService } from './support.service';
export declare class SupportController {
    private readonly support;
    constructor(support: SupportService);
    private userRole;
    getCategories(req: {
        user?: {
            role?: {
                name?: string;
            };
        };
    }): Promise<{
        id: string;
        role: string;
        name: string;
        slug: string;
        description: string | null;
        icon: string | null;
        sortOrder: number;
        subcategories: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            sortOrder: number;
            issues: {
                id: string;
                title: string;
                slug: string;
                description: string | null;
                keywords: string[];
                solution: string | null;
                actionType: string | null;
                actionUrl: string | null;
                requiresAdmin: boolean;
                priority: string;
                caseType: string;
            }[];
        }[];
    }[]>;
    getCategory(categoryId: string, req: {
        user?: {
            role?: {
                name?: string;
            };
        };
    }): Promise<{
        id: string;
        role: string;
        name: string;
        slug: string;
        description: string | null;
        icon: string | null;
        sortOrder: number;
        subcategories: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            sortOrder: number;
            issues: {
                id: string;
                title: string;
                slug: string;
                description: string | null;
                keywords: string[];
                solution: string | null;
                actionType: string | null;
                actionUrl: string | null;
                requiresAdmin: boolean;
                priority: string;
                caseType: string;
            }[];
        }[];
    }>;
    getIssue(issueId: string, req: {
        user?: {
            role?: {
                name?: string;
            };
        };
    }): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        keywords: string[];
        solution: string | null;
        actionType: string | null;
        actionUrl: string | null;
        requiresAdmin: boolean;
        priority: string;
        caseType: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        subcategory: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
    search(query: SearchQueryDto, req: {
        user?: {
            role?: {
                name?: string;
            };
        };
    }): Promise<{
        id: string;
        title: string;
        slug: string;
        categoryName: string;
        categoryId: string;
        subcategoryName: string;
        solution: string | null;
        requiresAdmin: boolean;
    }[]>;
    resolve(body: ResolveSupportDto, req: {
        user?: {
            id: string;
            role?: {
                name?: string;
            };
        };
    }): Promise<{
        resolved: boolean;
        solution: string;
        actionType: string | null;
        actionUrl: string | null;
        context: Record<string, unknown>;
        requiresCase?: undefined;
        issue?: undefined;
        message?: undefined;
    } | {
        resolved: boolean;
        requiresCase: boolean;
        issue: {
            id: string;
            title: string;
            slug: string;
            description: string | null;
            keywords: string[];
            solution: string | null;
            actionType: string | null;
            actionUrl: string | null;
            requiresAdmin: boolean;
            priority: string;
            caseType: string;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            subcategory: {
                id: string;
                name: string;
                slug: string;
            };
        };
        context: Record<string, unknown>;
        message: string;
        solution?: undefined;
        actionType?: undefined;
        actionUrl?: undefined;
    }>;
    createCase(body: CreateSupportCaseDto, req: {
        user?: {
            id: string;
            role?: {
                name?: string;
            };
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
    getCases(req: {
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
    }[]>;
    getCase(caseId: string, req: {
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
    sendMessage(caseId: string, body: SendMessageDto, req: {
        user?: {
            id: string;
            role?: {
                name?: string;
            };
        };
    }): Promise<{
        id: string;
        message: string;
        senderRole: string;
        createdAt: string;
    }>;
}
