import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCaseQueryDto, AdminNoteDto, AdminUpdateCaseDto, CreateSupportCaseDto, ResolveSupportDto } from './support.dto';
export declare class SupportService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private normalizeRole;
    private nextCaseNumber;
    private mapCategory;
    getCategories(userRole: string): Promise<{
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
    getCategory(categoryId: string, userRole: string): Promise<{
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
    getIssue(issueId: string, userRole: string): Promise<{
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
    search(userRole: string, query: string): Promise<{
        id: string;
        title: string;
        slug: string;
        categoryName: string;
        categoryId: string;
        subcategoryName: string;
        solution: string | null;
        requiresAdmin: boolean;
    }[]>;
    resolve(userId: string, userRole: string, dto: ResolveSupportDto): Promise<{
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
    createCase(userId: string, userRole: string, dto: CreateSupportCaseDto): Promise<{
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
    getUserCases(userId: string): Promise<{
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
    getUserCase(userId: string, caseId: string): Promise<{
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
    sendMessage(userId: string, userRole: string, caseId: string, message: string): Promise<{
        id: string;
        message: string;
        senderRole: string;
        createdAt: string;
    }>;
    getAdminSummary(): Promise<{
        openCases: number;
        highPriority: number;
        unassigned: number;
        waitingForUser: number;
        resolvedToday: number;
    }>;
    getAdminCases(query: AdminCaseQueryDto, adminId?: string): Promise<{
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
    getAdminCase(caseId: string): Promise<{
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
    adminUpdateCase(caseId: string, dto: AdminUpdateCaseDto, adminId: string): Promise<{
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
    adminAssign(caseId: string, adminId: string, assignToId: string): Promise<{
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
    adminReply(caseId: string, adminId: string, message: string): Promise<{
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
    adminAddNote(caseId: string, adminId: string, dto: AdminNoteDto): Promise<{
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
    adminResolve(caseId: string, adminId: string): Promise<{
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
    adminClose(caseId: string, adminId: string): Promise<{
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
    adminReopen(caseId: string, adminId: string): Promise<{
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
    private caseInclude;
    private mapCase;
}
