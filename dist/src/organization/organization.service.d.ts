import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { OrganizationType } from './organization.constants';
import { AcceptInvitationDto, ChangeMemberRoleDto, InviteMemberDto } from './organization.dto';
export declare class OrganizationService {
    private prisma;
    private notifications;
    private email;
    constructor(prisma: PrismaService, notifications: NotificationsService, email: EmailService);
    getTeam(userId: string): Promise<{
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
    inviteMember(userId: string, dto: InviteMemberDto): Promise<{
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
    acceptInvitation(userId: string, dto: AcceptInvitationDto): Promise<{
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
    changeMemberRole(userId: string, memberId: string, dto: ChangeMemberRoleDto): Promise<{
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
    removeMember(userId: string, memberId: string): Promise<{
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
    reinviteMember(userId: string, targetId: string): Promise<{
        id: string;
        email: string;
        role: string;
        roleLabel: string;
        status: string;
        invitedBy: string;
        expiresAt: string;
        createdAt: string;
    }>;
    cancelInvitation(userId: string, invitationId: string): Promise<{
        id: string;
        email: string;
        role: string;
        roleLabel: string;
        status: string;
        invitedBy: string;
        expiresAt: string;
        createdAt: string;
    }>;
    getRolePermissions(orgType: OrganizationType, role: string): {
        role: string;
        permissions: string[];
    };
    getMyInvitations(userId: string): Promise<{
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
    private resolveOrganizationContext;
    private ensureOrganization;
    private ensureProfileForOrgType;
    private requireOwner;
    private touchLastActive;
    private formatMember;
    private formatInvitation;
    private normalizeInvitationStatus;
    private notifyMemberInvited;
    private createAuditLog;
}
