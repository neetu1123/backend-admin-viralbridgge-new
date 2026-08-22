import { PrismaService } from '../prisma/prisma.service';
import { CrmLeadQueryDto } from './crm.dto';
export declare class CrmEnhancementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureAgentProfiles;
    getAgents(activeOnly?: boolean): Promise<{
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
    private recordAssignment;
    assignLead(leadId: string, agentId: string, userId: string): Promise<{
        success: boolean;
        assignedTo: string;
    }>;
    bulkAssign(leadIds: string[], agentId: string, userId: string): Promise<{
        success: boolean;
        count: number;
        assignedTo: string;
    }>;
    reassignLead(leadId: string, agentId: string, userId: string, reason?: string): Promise<{
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
    bulkUpdate(leadIds: string[], data: {
        leadStatus?: string;
        priority?: string;
        tags?: string[];
    }): Promise<{
        success: boolean;
        count: number;
    }>;
    bulkDelete(leadIds: string[]): Promise<{
        success: boolean;
        count: number;
    }>;
    bulkAutoAssign(leadIds: string[], userId: string): Promise<{
        success: boolean;
        count: number;
        strategy: string;
    }>;
    importPreview(fileName: string, rows: Record<string, string>[], userId: string): Promise<{
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
    importConfirm(importJobId: string, userId: string, duplicateStrategy?: 'SKIP' | 'UPDATE' | 'IMPORT_AS_NEW'): Promise<{
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
    getImportJob(id: string): Promise<{
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
    getImportErrorsCsv(id: string): Promise<string>;
    private buildWhereFromQuery;
    exportLeads(userId: string, opts: {
        leadIds?: string[];
        filters?: CrmLeadQueryDto;
        fields?: string[];
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
    getExportDownload(id: string): Promise<{
        fileName: string;
        csv: string;
    }>;
    getLeadIdsByFilters(query: CrmLeadQueryDto): Promise<string[]>;
}
