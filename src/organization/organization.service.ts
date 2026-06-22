import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { emitTeamAccepted, emitTeamInvited } from '../common/team-emitter';
import {
  INVITATION_EXPIRY_DAYS,
  INVITATION_STATUSES,
  ORG_ROLE_LABELS,
  OrganizationType,
  isValidOrgRole,
  permissionsForRole,
  rolesForOrgType,
} from './organization.constants';
import { AcceptInvitationDto, ChangeMemberRoleDto, InviteMemberDto } from './organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  async getTeam(userId: string) {
    const { organization, membership } = await this.resolveOrganizationContext(userId);
    await this.touchLastActive(membership.id);

    const [members, invitations] = await Promise.all([
      this.prisma.organizationMember.findMany({
        where: { organization_id: organization.id, status: 'ACTIVE' },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: [{ role: 'asc' }, { joined_at: 'asc' }],
      }),
      this.prisma.organizationInvitation.findMany({
        where: { organization_id: organization.id, status: 'PENDING' },
        include: { invited_by: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const orgType = organization.type as OrganizationType;
    const isOwner = membership.role === 'OWNER';

    return {
      organizationType: orgType,
      organizationId: organization.id,
      organizationName: organization.name,
      currentUserRole: membership.role,
      canManageTeam: isOwner,
      activeMembers: members.map((m) => this.formatMember(m)),
      pendingInvitations: invitations.map((inv) => this.formatInvitation(inv)),
      availableRoles: rolesForOrgType(orgType).filter((r) => r !== 'OWNER'),
    };
  }

  async inviteMember(userId: string, dto: InviteMemberDto) {
    const { organization, membership } = await this.resolveOrganizationContext(userId);
    this.requireOwner(membership);

    const orgType = organization.type as OrganizationType;
    if (!isValidOrgRole(orgType, dto.role)) {
      throw new BadRequestException(`Invalid role "${dto.role}" for ${orgType} organization`);
    }

    const email = dto.email.trim().toLowerCase();
    const owner = await this.prisma.user.findUnique({ where: { id: organization.owner_user_id } });
    if (owner?.email.toLowerCase() === email) {
      throw new BadRequestException('Cannot invite the organization owner');
    }

    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organization_id: organization.id,
        status: 'ACTIVE',
        user: { email: { equals: email, mode: 'insensitive' } },
      },
    });
    if (existingMember) {
      throw new BadRequestException('User is already an active team member');
    }

    const pendingInvite = await this.prisma.organizationInvitation.findFirst({
      where: { organization_id: organization.id, email, status: 'PENDING' },
    });
    if (pendingInvite) {
      throw new BadRequestException('A pending invitation already exists for this email');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        organization_id: organization.id,
        email,
        role: dto.role,
        token: randomUUID(),
        invited_by_id: userId,
        expires_at: expiresAt,
      },
      include: { invited_by: { select: { name: true, email: true } } },
    });

    let emailSent = false;
    try {
      await this.email.sendTeamInvitation({
        to: email,
        organizationName: organization.name,
        inviterName: invitation.invited_by.name,
        roleLabel: ORG_ROLE_LABELS[dto.role] ?? dto.role,
        expiresAt,
        acceptUrl: this.email.buildInvitationAcceptUrl(invitation.token),
      });
      emailSent = true;
    } catch (error) {
      await this.prisma.organizationInvitation.delete({ where: { id: invitation.id } }).catch(() => undefined);
      const message = error instanceof Error ? error.message : 'Failed to send invitation email';
      throw new BadRequestException(message);
    }

    await this.createAuditLog(userId, 'ORG_MEMBER_INVITED', 'OrganizationInvitation', invitation.id, {
      email,
      role: dto.role,
      organizationId: organization.id,
      emailSent: true,
    });

    await this.notifyMemberInvited({
      organization,
      invitation,
      role: dto.role,
      inviterId: userId,
    });

    const formatted = this.formatInvitation(invitation);
    return {
      invitation: formatted,
      permissionPreview: { role: dto.role, permissions: permissionsForRole(orgType, dto.role) },
      emailSent,
    };
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: { select: { id: true, name: true, type: true } },
        invited_by: { select: { name: true } },
      },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');

    const now = new Date();
    const isExpired = invitation.expires_at < now;
    const normalizedStatus = this.normalizeInvitationStatus(invitation.status);

    if (normalizedStatus === INVITATION_STATUSES.PENDING && isExpired) {
      await this.prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: INVITATION_STATUSES.EXPIRED },
      });
    }

    const status =
      normalizedStatus === INVITATION_STATUSES.PENDING && isExpired
        ? INVITATION_STATUSES.EXPIRED
        : normalizedStatus;

    return {
      organizationName: invitation.organization.name,
      organizationType: invitation.organization.type,
      role: invitation.role,
      roleLabel: ORG_ROLE_LABELS[invitation.role] ?? invitation.role,
      invitedBy: invitation.invited_by.name,
      email: invitation.email,
      expiresAt: invitation.expires_at.toISOString(),
      status,
      isExpired: status === INVITATION_STATUSES.EXPIRED,
      canAccept: status === INVITATION_STATUSES.PENDING && !isExpired,
    };
  }

  async acceptInvitation(userId: string, dto: AcceptInvitationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { token: dto.token },
      include: { organization: true },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (this.normalizeInvitationStatus(invitation.status) !== INVITATION_STATUSES.PENDING) {
      throw new BadRequestException(`Invitation is ${this.normalizeInvitationStatus(invitation.status).toLowerCase()}`);
    }
    if (invitation.expires_at < new Date()) {
      await this.prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: INVITATION_STATUSES.EXPIRED },
      });
      throw new BadRequestException('Invitation has expired');
    }
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('Invitation email does not match your account');
    }

    const orgType = invitation.organization.type as OrganizationType;
    const expectedPlatformRole = orgType === 'BRAND' ? 'BRAND' : 'CREATOR';
    if (user.role?.name && !['ADMIN', 'SUPER_ADMIN'].includes(user.role.name)) {
      if (user.role.name !== expectedPlatformRole) {
        const platformRole = await this.prisma.role.findUnique({ where: { name: expectedPlatformRole } });
        if (platformRole) {
          await this.prisma.user.update({ where: { id: userId }, data: { role_id: platformRole.id } });
        }
      }
    }

    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        organization_id_user_id: {
          organization_id: invitation.organization_id,
          user_id: userId,
        },
      },
    });
    if (existing?.status === 'ACTIVE') {
      throw new BadRequestException('You are already a member of this organization');
    }

    const member = await this.prisma.$transaction(async (tx) => {
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: INVITATION_STATUSES.ACCEPTED, accepted_at: new Date() },
      });

      if (existing) {
        return tx.organizationMember.update({
          where: { id: existing.id },
          data: {
            role: invitation.role,
            status: 'ACTIVE',
            invited_by_id: invitation.invited_by_id,
            joined_at: new Date(),
            last_active_at: new Date(),
          },
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
      }

      return tx.organizationMember.create({
        data: {
          organization_id: invitation.organization_id,
          user_id: userId,
          role: invitation.role,
          status: 'ACTIVE',
          invited_by_id: invitation.invited_by_id,
          last_active_at: new Date(),
        },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      });
    });

    await this.ensureProfileForOrgType(userId, user.name, orgType, invitation.organization.name);

    await this.createAuditLog(userId, 'ORG_INVITATION_ACCEPTED', 'OrganizationMember', member.id, {
      organizationId: invitation.organization_id,
      role: invitation.role,
    });

    await this.notifications.create({
      userId: invitation.organization.owner_user_id,
      title: 'Invitation accepted',
      message: `${user.name} accepted your team invitation and joined as ${ORG_ROLE_LABELS[invitation.role] ?? invitation.role}.`,
      type: 'TEAM',
      entityType: 'OrganizationMember',
      entityId: member.id,
    });

    const owner = await this.prisma.user.findUnique({
      where: { id: invitation.organization.owner_user_id },
      select: { email: true },
    });
    if (owner?.email) {
      await this.email.sendInvitationAccepted({
        to: owner.email,
        memberName: user.name,
        memberEmail: user.email,
        organizationName: invitation.organization.name,
        roleLabel: ORG_ROLE_LABELS[invitation.role] ?? invitation.role,
      }).catch((err) => console.error('Accept notification email failed:', err));
    }

    const acceptPayload = {
      organizationId: invitation.organization_id,
      organizationName: invitation.organization.name,
      memberId: member.id,
      memberName: user.name,
      role: invitation.role,
    };
    emitTeamAccepted(invitation.organization.owner_user_id, acceptPayload);
    emitTeamAccepted(userId, acceptPayload);

    return this.formatMember(member);
  }

  async changeMemberRole(userId: string, memberId: string, dto: ChangeMemberRoleDto) {
    const { organization, membership } = await this.resolveOrganizationContext(userId);
    this.requireOwner(membership);

    const orgType = organization.type as OrganizationType;
    if (!isValidOrgRole(orgType, dto.role)) {
      throw new BadRequestException(`Invalid role "${dto.role}" for ${orgType} organization`);
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, organization_id: organization.id, status: 'ACTIVE' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    if (!member) throw new NotFoundException('Team member not found');
    if (member.role === 'OWNER') throw new ForbiddenException('Cannot change the owner role');

    const updated = await this.prisma.organizationMember.update({
      where: { id: member.id },
      data: { role: dto.role },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    await this.createAuditLog(userId, 'ORG_MEMBER_ROLE_CHANGED', 'OrganizationMember', member.id, {
      previousRole: member.role,
      newRole: dto.role,
      memberEmail: member.user.email,
    });

    await this.notifications.create({
      userId: member.user_id,
      title: 'Role updated',
      message: `Your role in ${organization.name} was changed to ${ORG_ROLE_LABELS[dto.role] ?? dto.role}.`,
      type: 'TEAM',
      entityType: 'OrganizationMember',
      entityId: member.id,
    });

    return this.formatMember(updated);
  }

  async removeMember(userId: string, memberId: string) {
    const { organization, membership } = await this.resolveOrganizationContext(userId);
    this.requireOwner(membership);

    const member = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, organization_id: organization.id, status: 'ACTIVE' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    if (!member) throw new NotFoundException('Team member not found');
    if (member.role === 'OWNER') throw new ForbiddenException('Cannot remove the organization owner');
    if (member.user_id === userId) throw new BadRequestException('Cannot remove yourself');

    const updated = await this.prisma.organizationMember.update({
      where: { id: member.id },
      data: { status: 'REMOVED' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    await this.createAuditLog(userId, 'ORG_MEMBER_REMOVED', 'OrganizationMember', member.id, {
      memberEmail: member.user.email,
      role: member.role,
    });

    const remover = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    await this.notifications.create({
      userId: member.user_id,
      title: 'Removed from team',
      message: `You were removed from ${organization.name}.`,
      type: 'TEAM',
      entityType: 'OrganizationMember',
      entityId: member.id,
    });

    await this.email.sendMemberRemoved({
      to: member.user.email,
      organizationName: organization.name,
      removedByName: remover?.name ?? 'Organization owner',
    }).catch((err) => console.error('Member removed email failed:', err));

    return { removed: true, member: this.formatMember({ ...updated, status: 'REMOVED' }) };
  }

  async reinviteMember(userId: string, targetId: string) {
    const { organization, membership } = await this.resolveOrganizationContext(userId);
    this.requireOwner(membership);

    const invitation = await this.prisma.organizationInvitation.findFirst({
      where: { id: targetId, organization_id: organization.id, status: 'PENDING' },
      include: { invited_by: { select: { name: true } } },
    });
    if (!invitation) throw new NotFoundException('Pending invitation not found');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const updated = await this.prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { expires_at: expiresAt, token: randomUUID() },
      include: { invited_by: { select: { name: true } } },
    });

    try {
      await this.email.sendReInvitation({
        to: invitation.email,
        organizationName: organization.name,
        inviterName: updated.invited_by.name,
        roleLabel: ORG_ROLE_LABELS[invitation.role] ?? invitation.role,
        expiresAt,
        acceptUrl: this.email.buildInvitationAcceptUrl(updated.token),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send invitation email';
      throw new BadRequestException(message);
    }

    await this.createAuditLog(userId, 'ORG_INVITATION_RESENT', 'OrganizationInvitation', invitation.id, {
      email: invitation.email,
      emailSent: true,
    });

    const invitee = await this.prisma.user.findFirst({
      where: { email: { equals: invitation.email, mode: 'insensitive' } },
    });
    if (invitee) {
      await this.notifications.create({
        userId: invitee.id,
        title: 'Team invitation reminder',
        message: `Reminder: you have been invited to join ${organization.name}.`,
        type: 'TEAM',
        entityType: 'OrganizationInvitation',
        entityId: updated.id,
        metadata: { token: updated.token },
      });
      emitTeamInvited(invitee.id, {
        invitationId: updated.id,
        organizationName: organization.name,
        role: invitation.role,
        token: updated.token,
      });
    }

    return this.formatInvitation(updated);
  }

  async cancelInvitation(userId: string, invitationId: string) {
    const { organization, membership } = await this.resolveOrganizationContext(userId);
    this.requireOwner(membership);

    const invitation = await this.prisma.organizationInvitation.findFirst({
      where: { id: invitationId, organization_id: organization.id, status: 'PENDING' },
    });
    if (!invitation) throw new NotFoundException('Pending invitation not found');

    const updated = await this.prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: INVITATION_STATUSES.REVOKED },
      include: { invited_by: { select: { name: true } } },
    });

    await this.createAuditLog(userId, 'ORG_INVITATION_REVOKED', 'OrganizationInvitation', invitation.id, {
      email: invitation.email,
    });

    const invitee = await this.prisma.user.findFirst({
      where: { email: { equals: invitation.email, mode: 'insensitive' } },
    });
    if (invitee) {
      await this.notifications.create({
        userId: invitee.id,
        title: 'Invitation cancelled',
        message: `Your invitation to join ${organization.name} was cancelled.`,
        type: 'TEAM',
        entityType: 'OrganizationInvitation',
        entityId: invitation.id,
      });
    }

    return this.formatInvitation(updated);
  }

  getRolePermissions(orgType: OrganizationType, role: string) {
    return { role, permissions: permissionsForRole(orgType, role) };
  }

  async getMyInvitations(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const invitations = await this.prisma.organizationInvitation.findMany({
      where: {
        email: { equals: user.email, mode: 'insensitive' },
        status: 'PENDING',
        expires_at: { gt: new Date() },
      },
      include: {
        organization: { select: { id: true, name: true, type: true } },
        invited_by: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return invitations.map((inv) => ({
      ...this.formatInvitation(inv),
      token: inv.token,
      organizationId: inv.organization.id,
      organizationName: inv.organization.name,
      organizationType: inv.organization.type,
    }));
  }

  private async resolveOrganizationContext(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, brand_profile: true, creator_profile: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const roleName = user.role?.name ?? '';
    const activeMemberships = await this.prisma.organizationMember.findMany({
      where: { user_id: userId, status: 'ACTIVE' },
      include: { organization: true },
      orderBy: { joined_at: 'asc' },
    });

    if (activeMemberships.length > 0) {
      const preferred =
        activeMemberships.find(
          (m) => m.organization.type === 'BRAND' && ['BRAND', 'ADMIN', 'SUPER_ADMIN'].includes(roleName),
        ) ??
        activeMemberships.find((m) => m.organization.type === 'CREATOR' && roleName === 'CREATOR') ??
        activeMemberships.find((m) => m.organization.owner_user_id === userId) ??
        activeMemberships[0];

      return { organization: preferred.organization, membership: preferred };
    }

    let orgType: OrganizationType | null = null;
    if (['BRAND', 'ADMIN', 'SUPER_ADMIN'].includes(roleName)) {
      orgType = 'BRAND';
    } else if (roleName === 'CREATOR') {
      orgType = 'CREATOR';
    }

    if (!orgType) {
      throw new ForbiddenException('No organization context found for this user');
    }

    const organization = await this.ensureOrganization(user, orgType);
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organization_id_user_id: { organization_id: organization.id, user_id: userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not an active member of this organization');
    }

    return { organization, membership };
  }

  private async ensureOrganization(
    user: {
      id: string;
      name: string;
      brand_profile?: { id: string; company_name: string } | null;
      creator_profile?: { id: string; full_name: string | null } | null;
    },
    orgType: OrganizationType,
  ) {
    if (orgType === 'BRAND') {
      const profile =
        user.brand_profile ??
        (await this.prisma.brandProfile.upsert({
          where: { user_id: user.id },
          update: {},
          create: { user_id: user.id, company_name: user.name },
        }));

      let org = await this.prisma.organization.findUnique({ where: { brand_profile_id: profile.id } });
      if (!org) {
        org = await this.prisma.organization.create({
          data: {
            type: 'BRAND',
            name: profile.company_name,
            owner_user_id: user.id,
            brand_profile_id: profile.id,
          },
        });
        await this.prisma.organizationMember.create({
          data: {
            organization_id: org.id,
            user_id: user.id,
            role: 'OWNER',
            status: 'ACTIVE',
            last_active_at: new Date(),
          },
        });
      }
      return org;
    }

    const profile =
      user.creator_profile ??
      (await this.prisma.creatorProfile.upsert({
        where: { user_id: user.id },
        update: {},
        create: { user_id: user.id, full_name: user.name },
      }));

    let org = await this.prisma.organization.findUnique({ where: { creator_profile_id: profile.id } });
    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          type: 'CREATOR',
          name: profile.full_name ?? user.name,
          owner_user_id: user.id,
          creator_profile_id: profile.id,
        },
      });
      await this.prisma.organizationMember.create({
        data: {
          organization_id: org.id,
          user_id: user.id,
          role: 'OWNER',
          status: 'ACTIVE',
          last_active_at: new Date(),
        },
      });
    }
    return org;
  }

  private async ensureProfileForOrgType(
    userId: string,
    userName: string,
    orgType: OrganizationType,
    orgName: string,
  ) {
    if (orgType === 'BRAND') {
      await this.prisma.brandProfile.upsert({
        where: { user_id: userId },
        update: {},
        create: { user_id: userId, company_name: orgName || userName },
      });
      return;
    }
    await this.prisma.creatorProfile.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId, full_name: userName },
    });
  }

  private requireOwner(membership: { role: string }) {
    if (membership.role !== 'OWNER') {
      throw new ForbiddenException('Only the organization owner can perform this action');
    }
  }

  private async touchLastActive(memberId: string) {
    await this.prisma.organizationMember.update({
      where: { id: memberId },
      data: { last_active_at: new Date() },
    }).catch(() => undefined);
  }

  private formatMember(member: {
    id: string;
    user_id: string;
    role: string;
    status: string;
    last_active_at: Date | null;
    joined_at: Date;
    user: { id: string; name: string; email: string; avatar: string | null };
  }) {
    return {
      id: member.id,
      userId: member.user_id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      roleLabel: ORG_ROLE_LABELS[member.role] ?? member.role,
      status: member.status,
      lastActiveAt: member.last_active_at?.toISOString() ?? null,
      joinedAt: member.joined_at.toISOString(),
      isOwner: member.role === 'OWNER',
    };
  }

  private formatInvitation(inv: {
    id: string;
    email: string;
    role: string;
    status: string;
    expires_at: Date;
    created_at: Date;
    invited_by?: { name: string } | null;
  }) {
    return {
      id: inv.id,
      email: inv.email,
      role: inv.role,
      roleLabel: ORG_ROLE_LABELS[inv.role] ?? inv.role,
      status: this.normalizeInvitationStatus(inv.status),
      invitedBy: inv.invited_by?.name ?? 'Unknown',
      expiresAt: inv.expires_at.toISOString(),
      createdAt: inv.created_at.toISOString(),
    };
  }

  private normalizeInvitationStatus(status: string): string {
    if (status === 'CANCELLED') return INVITATION_STATUSES.REVOKED;
    return status;
  }

  private async notifyMemberInvited(params: {
    organization: { id: string; name: string; owner_user_id: string };
    invitation: { id: string; email: string; token: string; invited_by: { name: string } };
    role: string;
    inviterId: string;
  }) {
    const { organization, invitation, role } = params;
    const roleLabel = ORG_ROLE_LABELS[role] ?? role;
    const payload = {
      invitationId: invitation.id,
      organizationId: organization.id,
      organizationName: organization.name,
      role,
      roleLabel,
      token: invitation.token,
      acceptUrl: this.email.buildInvitationAcceptUrl(invitation.token),
    };

    const invitee = await this.prisma.user.findFirst({
      where: { email: { equals: invitation.email, mode: 'insensitive' } },
    });
    if (invitee) {
      await this.notifications.create({
        userId: invitee.id,
        title: 'Team invitation',
        message: `You have been invited to join ${organization.name} as ${roleLabel}.`,
        type: 'TEAM',
        entityType: 'OrganizationInvitation',
        entityId: invitation.id,
        metadata: payload,
      });
      emitTeamInvited(invitee.id, payload);
    }

    if (organization.owner_user_id !== params.inviterId) {
      await this.notifications.create({
        userId: organization.owner_user_id,
        title: 'Member invited',
        message: `${invitation.invited_by.name} invited ${invitation.email} to join ${organization.name} as ${roleLabel}.`,
        type: 'TEAM',
        entityType: 'OrganizationInvitation',
        entityId: invitation.id,
        metadata: payload,
      });
    }
  }

  private async createAuditLog(
    actorId: string,
    action: string,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          admin_id: actorId,
          action,
          entity,
          entity_id: entityId,
          metadata: (metadata ?? {}) as object,
        },
      });
    } catch (e) {
      console.error('AuditLog write failed:', e);
    }
  }
}
