import { AcceptInvitationDto, ChangeMemberRoleDto, InviteMemberDto } from './organization.dto';
import { OrganizationService } from './organization.service';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    getTeam(req: {
        user: {
            id: string;
        };
    }): Promise<{
        organizationType: "CREATOR" | "BRAND";
        organizationId: string;
        organizationName: string;
        currentUserRole: string;
        canManageTeam: boolean;
        activeMembers: {
            id: string;
            userId: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            roleLabel: string;
            status: string;
            lastActiveAt: string | null;
            joinedAt: string;
            isOwner: boolean;
        }[];
        pendingInvitations: {
            id: string;
            email: string;
            role: string;
            roleLabel: string;
            status: string;
            invitedBy: string;
            expiresAt: string;
            createdAt: string;
        }[];
        availableRoles: string[];
    }>;
    inviteMember(req: {
        user: {
            id: string;
        };
    }, body: InviteMemberDto): Promise<{
        invitation: {
            id: string;
            email: string;
            role: string;
            roleLabel: string;
            status: string;
            invitedBy: string;
            expiresAt: string;
            createdAt: string;
        };
        permissionPreview: {
            role: string;
            permissions: string[];
        };
        emailSent: boolean;
    }>;
    getMyInvitations(req: {
        user: {
            id: string;
        };
    }): Promise<{
        token: string;
        organizationId: string;
        organizationName: string;
        organizationType: string;
        id: string;
        email: string;
        role: string;
        roleLabel: string;
        status: string;
        invitedBy: string;
        expiresAt: string;
        createdAt: string;
    }[]>;
    acceptInvitation(req: {
        user: {
            id: string;
        };
    }, body: AcceptInvitationDto): Promise<{
        id: string;
        userId: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        roleLabel: string;
        status: string;
        lastActiveAt: string | null;
        joinedAt: string;
        isOwner: boolean;
    }>;
    changeMemberRole(req: {
        user: {
            id: string;
        };
    }, id: string, body: ChangeMemberRoleDto): Promise<{
        id: string;
        userId: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        roleLabel: string;
        status: string;
        lastActiveAt: string | null;
        joinedAt: string;
        isOwner: boolean;
    }>;
    removeMember(req: {
        user: {
            id: string;
        };
    }, id: string): Promise<{
        removed: boolean;
        member: {
            id: string;
            userId: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            roleLabel: string;
            status: string;
            lastActiveAt: string | null;
            joinedAt: string;
            isOwner: boolean;
        };
    }>;
    reinviteMember(req: {
        user: {
            id: string;
        };
    }, id: string): Promise<{
        id: string;
        email: string;
        role: string;
        roleLabel: string;
        status: string;
        invitedBy: string;
        expiresAt: string;
        createdAt: string;
    }>;
    cancelInvitation(req: {
        user: {
            id: string;
        };
    }, id: string): Promise<{
        id: string;
        email: string;
        role: string;
        roleLabel: string;
        status: string;
        invitedBy: string;
        expiresAt: string;
        createdAt: string;
    }>;
    getRolePermissions(type: 'BRAND' | 'CREATOR', role: string): {
        role: string;
        permissions: string[];
    };
}
