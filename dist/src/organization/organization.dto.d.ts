import type { OrganizationType } from './organization.constants';
export declare class InviteMemberDto {
    email: string;
    role: string;
}
export declare class AcceptInvitationDto {
    token: string;
}
export declare class ChangeMemberRoleDto {
    role: string;
}
export declare class TeamMemberResponseDto {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    roleLabel: string;
    status: string;
    lastActiveAt?: string | null;
    joinedAt: string;
    isOwner: boolean;
}
export declare class PendingInvitationResponseDto {
    id: string;
    email: string;
    role: string;
    roleLabel: string;
    status: string;
    invitedBy: string;
    expiresAt: string;
    createdAt: string;
}
export declare class TeamResponseDto {
    organizationType: OrganizationType;
    organizationId: string;
    organizationName: string;
    currentUserRole: string;
    canManageTeam: boolean;
    activeMembers: TeamMemberResponseDto[];
    pendingInvitations: PendingInvitationResponseDto[];
    availableRoles: string[];
}
export declare class RolePermissionsDto {
    role: string;
    permissions: string[];
}
export declare class InviteMemberResponseDto {
    invitation: PendingInvitationResponseDto;
    permissionPreview: RolePermissionsDto;
    emailSent: boolean;
}
export declare class InvitationPreviewDto {
    organizationName: string;
    organizationType: OrganizationType;
    role: string;
    roleLabel: string;
    invitedBy: string;
    email: string;
    expiresAt: string;
    status: string;
    isExpired: boolean;
    canAccept: boolean;
}
