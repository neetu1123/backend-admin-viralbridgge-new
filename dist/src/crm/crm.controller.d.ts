import { BulkAssignDto, BulkLeadIdsDto, BulkUpdateDto, CreateCrmFollowUpDto, CreateCrmLeadDto, CreateCrmNoteDto, CrmLeadQueryDto, ExportLeadsDto, ImportConfirmDto, ImportPreviewDto, ReassignLeadDto, UpdateCrmLeadDto, UpdateCrmNoteDto } from './crm.dto';
import { CrmService } from './crm.service';
import { CrmEnhancementService } from './crm-enhancement.service';
export declare class CrmController {
    private readonly crm;
    private readonly crmEnhancement;
    constructor(crm: CrmService, crmEnhancement: CrmEnhancementService);
    getSummary(): Promise<{
        totalLeads: number;
        newLeads: number;
        qualifiedLeads: number;
        convertedLeads: number;
        lostLeads: number;
        todaysFollowUps: number;
    }>;
    getAssignees(): Promise<{
        name: string;
        id: string;
        email: string;
    }[]>;
    getLeads(query: CrmLeadQueryDto): Promise<{
        data: {
            id: string;
            firstName: string;
            lastName: string;
            profilePhoto: string | undefined;
            gender: string | undefined;
            dateOfBirth: string | undefined;
            email: string;
            phone: string;
            alternatePhone: string | undefined;
            whatsapp: string | undefined;
            website: string | undefined;
            company: string;
            jobTitle: string | undefined;
            industry: string | undefined;
            companySize: string | undefined;
            gstNumber: string | undefined;
            country: string | undefined;
            state: string | undefined;
            city: string | undefined;
            postalCode: string | undefined;
            address: string | undefined;
            leadType: string;
            leadSource: string;
            priority: string;
            leadStatus: string;
            assignedToId: string | undefined;
            assignedToName: string | undefined;
            dealCurrency: string;
            dealValue: number | undefined;
            nextFollowUpDate: string | undefined;
            nextFollowUpTime: string | undefined;
            description: string | undefined;
            internalNotes: string | undefined;
            tags: string[];
            notes: {
                id: string;
                content: string;
                createdBy: string;
                createdAt: string;
                updatedAt: string | undefined;
            }[];
            followUps: {
                id: string;
                title: string;
                date: string;
                time: string;
                status: string;
                notes: string | undefined;
                createdAt: string;
            }[];
            attachments: {
                id: string;
                name: string;
                type: string;
                size: string;
                uploadedAt: string;
            }[];
            timeline: {
                id: string;
                type: string;
                title: string;
                description: string | undefined;
                createdBy: string | undefined;
                createdAt: string;
            }[];
            createdAt: string;
            updatedAt: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getLead(id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        profilePhoto: string | undefined;
        gender: string | undefined;
        dateOfBirth: string | undefined;
        email: string;
        phone: string;
        alternatePhone: string | undefined;
        whatsapp: string | undefined;
        website: string | undefined;
        company: string;
        jobTitle: string | undefined;
        industry: string | undefined;
        companySize: string | undefined;
        gstNumber: string | undefined;
        country: string | undefined;
        state: string | undefined;
        city: string | undefined;
        postalCode: string | undefined;
        address: string | undefined;
        leadType: string;
        leadSource: string;
        priority: string;
        leadStatus: string;
        assignedToId: string | undefined;
        assignedToName: string | undefined;
        dealCurrency: string;
        dealValue: number | undefined;
        nextFollowUpDate: string | undefined;
        nextFollowUpTime: string | undefined;
        description: string | undefined;
        internalNotes: string | undefined;
        tags: string[];
        notes: {
            id: string;
            content: string;
            createdBy: string;
            createdAt: string;
            updatedAt: string | undefined;
        }[];
        followUps: {
            id: string;
            title: string;
            date: string;
            time: string;
            status: string;
            notes: string | undefined;
            createdAt: string;
        }[];
        attachments: {
            id: string;
            name: string;
            type: string;
            size: string;
            uploadedAt: string;
        }[];
        timeline: {
            id: string;
            type: string;
            title: string;
            description: string | undefined;
            createdBy: string | undefined;
            createdAt: string;
        }[];
        createdAt: string;
        updatedAt: string;
    }>;
    createLead(body: CreateCrmLeadDto, req: {
        user?: {
            id: string;
            name: string;
        };
    }): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        profilePhoto: string | undefined;
        gender: string | undefined;
        dateOfBirth: string | undefined;
        email: string;
        phone: string;
        alternatePhone: string | undefined;
        whatsapp: string | undefined;
        website: string | undefined;
        company: string;
        jobTitle: string | undefined;
        industry: string | undefined;
        companySize: string | undefined;
        gstNumber: string | undefined;
        country: string | undefined;
        state: string | undefined;
        city: string | undefined;
        postalCode: string | undefined;
        address: string | undefined;
        leadType: string;
        leadSource: string;
        priority: string;
        leadStatus: string;
        assignedToId: string | undefined;
        assignedToName: string | undefined;
        dealCurrency: string;
        dealValue: number | undefined;
        nextFollowUpDate: string | undefined;
        nextFollowUpTime: string | undefined;
        description: string | undefined;
        internalNotes: string | undefined;
        tags: string[];
        notes: {
            id: string;
            content: string;
            createdBy: string;
            createdAt: string;
            updatedAt: string | undefined;
        }[];
        followUps: {
            id: string;
            title: string;
            date: string;
            time: string;
            status: string;
            notes: string | undefined;
            createdAt: string;
        }[];
        attachments: {
            id: string;
            name: string;
            type: string;
            size: string;
            uploadedAt: string;
        }[];
        timeline: {
            id: string;
            type: string;
            title: string;
            description: string | undefined;
            createdBy: string | undefined;
            createdAt: string;
        }[];
        createdAt: string;
        updatedAt: string;
    }>;
    updateLead(id: string, body: UpdateCrmLeadDto, req: {
        user?: {
            name: string;
        };
    }): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        profilePhoto: string | undefined;
        gender: string | undefined;
        dateOfBirth: string | undefined;
        email: string;
        phone: string;
        alternatePhone: string | undefined;
        whatsapp: string | undefined;
        website: string | undefined;
        company: string;
        jobTitle: string | undefined;
        industry: string | undefined;
        companySize: string | undefined;
        gstNumber: string | undefined;
        country: string | undefined;
        state: string | undefined;
        city: string | undefined;
        postalCode: string | undefined;
        address: string | undefined;
        leadType: string;
        leadSource: string;
        priority: string;
        leadStatus: string;
        assignedToId: string | undefined;
        assignedToName: string | undefined;
        dealCurrency: string;
        dealValue: number | undefined;
        nextFollowUpDate: string | undefined;
        nextFollowUpTime: string | undefined;
        description: string | undefined;
        internalNotes: string | undefined;
        tags: string[];
        notes: {
            id: string;
            content: string;
            createdBy: string;
            createdAt: string;
            updatedAt: string | undefined;
        }[];
        followUps: {
            id: string;
            title: string;
            date: string;
            time: string;
            status: string;
            notes: string | undefined;
            createdAt: string;
        }[];
        attachments: {
            id: string;
            name: string;
            type: string;
            size: string;
            uploadedAt: string;
        }[];
        timeline: {
            id: string;
            type: string;
            title: string;
            description: string | undefined;
            createdBy: string | undefined;
            createdAt: string;
        }[];
        createdAt: string;
        updatedAt: string;
    }>;
    deleteLead(id: string): Promise<{
        success: boolean;
    }>;
    archiveLead(id: string, req: {
        user?: {
            name: string;
        };
    }): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        profilePhoto: string | undefined;
        gender: string | undefined;
        dateOfBirth: string | undefined;
        email: string;
        phone: string;
        alternatePhone: string | undefined;
        whatsapp: string | undefined;
        website: string | undefined;
        company: string;
        jobTitle: string | undefined;
        industry: string | undefined;
        companySize: string | undefined;
        gstNumber: string | undefined;
        country: string | undefined;
        state: string | undefined;
        city: string | undefined;
        postalCode: string | undefined;
        address: string | undefined;
        leadType: string;
        leadSource: string;
        priority: string;
        leadStatus: string;
        assignedToId: string | undefined;
        assignedToName: string | undefined;
        dealCurrency: string;
        dealValue: number | undefined;
        nextFollowUpDate: string | undefined;
        nextFollowUpTime: string | undefined;
        description: string | undefined;
        internalNotes: string | undefined;
        tags: string[];
        notes: {
            id: string;
            content: string;
            createdBy: string;
            createdAt: string;
            updatedAt: string | undefined;
        }[];
        followUps: {
            id: string;
            title: string;
            date: string;
            time: string;
            status: string;
            notes: string | undefined;
            createdAt: string;
        }[];
        attachments: {
            id: string;
            name: string;
            type: string;
            size: string;
            uploadedAt: string;
        }[];
        timeline: {
            id: string;
            type: string;
            title: string;
            description: string | undefined;
            createdBy: string | undefined;
            createdAt: string;
        }[];
        createdAt: string;
        updatedAt: string;
    }>;
    addNote(id: string, body: CreateCrmNoteDto, req: {
        user?: {
            name: string;
        };
    }): Promise<{
        id: string;
        content: string;
        createdBy: string;
        createdAt: string;
    }>;
    updateNote(leadId: string, noteId: string, body: UpdateCrmNoteDto): Promise<{
        success: boolean;
    }>;
    deleteNote(leadId: string, noteId: string): Promise<{
        success: boolean;
    }>;
    addFollowUp(id: string, body: CreateCrmFollowUpDto): Promise<{
        id: string;
        title: string;
        date: string;
        time: string;
        status: string;
        notes: string | undefined;
        createdAt: string;
    }>;
    completeFollowUp(leadId: string, followUpId: string): Promise<{
        success: boolean;
    }>;
    getAgents(activeOnly?: string): Promise<{
        id: string;
        userId: string;
        name: string;
        email: string;
        avatar: string | undefined;
        phone: string | undefined;
        status: string;
        assignedLeads: number;
        todaysFollowUps: number;
        lastActivity: string | undefined;
    }[]>;
    getAgentWorkload(userId: string): Promise<{
        userId: string;
        name: string;
        email: string;
        status: string;
        assignedLeads: number;
        todaysFollowUps: number;
    }>;
    bulkAssign(body: BulkAssignDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        success: boolean;
        count: number;
        assignedTo: string;
    }>;
    bulkAutoAssign(body: BulkLeadIdsDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        success: boolean;
        count: number;
        strategy: string;
    }>;
    bulkUpdate(body: BulkUpdateDto): Promise<{
        success: boolean;
        count: number;
    }>;
    bulkDelete(body: BulkLeadIdsDto): Promise<{
        success: boolean;
        count: number;
    }>;
    assignLead(leadId: string, body: {
        agentId: string;
    }, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        success: boolean;
        assignedTo: string;
    }>;
    reassignLead(leadId: string, body: ReassignLeadDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        success: boolean;
        assignedTo: string;
    }>;
    getAssignmentHistory(leadId: string): Promise<{
        id: string;
        previousAgentId: string | null;
        previousAgentName: string | undefined;
        newAgentId: string | null;
        newAgentName: string | undefined;
        assignedByName: string | undefined;
        reason: string | null;
        assignmentType: string;
        createdAt: string;
    }[]>;
    importPreview(body: ImportPreviewDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        importJobId: string;
        totalRows: number;
        valid: number;
        warnings: number;
        duplicates: number;
        errors: number;
        preview: {
            status: string;
            rowNumber: number;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            company: string;
            leadType: string;
            leadSource: string;
            priority: string;
            leadStatus: string;
            assignedAgentEmail: string;
            dealValue: number | undefined;
            nextFollowUpDate: string | undefined;
            description: string | undefined;
            tags: string[];
            errors: string[];
            warnings: string[];
        }[];
    }>;
    importConfirm(body: ImportConfirmDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        importJobId: string;
        imported: number;
        duplicates: number;
        failed: number;
        status: string;
    }>;
    getImportHistory(): Promise<{
        id: string;
        fileName: string;
        importedBy: string;
        date: string;
        totalRows: number;
        imported: number;
        duplicates: number;
        failed: number;
        status: string;
    }[]>;
    getImportJob(importId: string): Promise<{
        id: string;
        fileName: string;
        uploadedBy: string;
        uploadedDate: string;
        completedAt: string | undefined;
        totalRecords: number;
        successfulRecords: number;
        duplicateRecords: number;
        failedRecords: number;
        status: string;
        errors: {
            rowNumber: number;
            error: string;
            suggestedFix: string | null;
        }[];
    }>;
    getImportErrors(importId: string): Promise<string>;
    exportLeads(body: ExportLeadsDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        exportJobId: string;
        recordCount: any;
        csv: string;
    }>;
    getExportHistory(): Promise<{
        id: string;
        fileName: string;
        requestedBy: string;
        date: string;
        recordCount: number;
        status: string;
    }[]>;
    getExportDownload(exportId: string): Promise<{
        fileName: string;
        csv: string;
    }>;
    getLeadIdsByFilters(body: CrmLeadQueryDto): Promise<string[]>;
}
