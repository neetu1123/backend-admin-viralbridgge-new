import { CreateCrmFollowUpDto, CreateCrmLeadDto, CreateCrmNoteDto, CrmLeadQueryDto, UpdateCrmLeadDto, UpdateCrmNoteDto } from './crm.dto';
import { CrmService } from './crm.service';
export declare class CrmController {
    private readonly crm;
    constructor(crm: CrmService);
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
}
