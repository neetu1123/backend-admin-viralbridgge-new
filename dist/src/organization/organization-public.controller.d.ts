import { OrganizationService } from './organization.service';
export declare class OrganizationPublicController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    getInvitationByToken(token: string): Promise<{
        organizationName: string;
        organizationType: string;
        role: string;
        roleLabel: string;
        invitedBy: string;
        email: string;
        expiresAt: string;
        status: string;
        isExpired: boolean;
        canAccept: boolean;
    }>;
}
