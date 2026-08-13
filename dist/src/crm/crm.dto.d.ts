export declare class CreateCrmLeadDto {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    gender?: string;
    dateOfBirth?: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    whatsapp?: string;
    website?: string;
    company: string;
    jobTitle?: string;
    industry?: string;
    companySize?: string;
    gstNumber?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    address?: string;
    leadType: string;
    leadSource: string;
    priority: string;
    leadStatus?: string;
    assignedToId?: string;
    dealCurrency?: string;
    dealValue?: number;
    nextFollowUpDate?: string;
    nextFollowUpTime?: string;
    description?: string;
    internalNotes?: string;
    tags?: string[];
}
export declare class UpdateCrmLeadDto extends CreateCrmLeadDto {
}
export declare class CreateCrmNoteDto {
    content: string;
}
export declare class UpdateCrmNoteDto {
    content: string;
}
export declare class CreateCrmFollowUpDto {
    title: string;
    date: string;
    time: string;
    notes?: string;
}
export declare class CrmLeadQueryDto {
    search?: string;
    leadStatus?: string;
    leadType?: string;
    priority?: string;
    assignedToId?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: string;
    limit?: string;
}
