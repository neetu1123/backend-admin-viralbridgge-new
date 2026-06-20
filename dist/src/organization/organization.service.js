"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const organization_constants_1 = require("./organization.constants");
let OrganizationService = class OrganizationService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async getTeam(userId) {
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
        const orgType = organization.type;
        const isOwner = membership.role === 'OWNER';
        return {
            organizationType: orgType,
            organizationId: organization.id,
            organizationName: organization.name,
            currentUserRole: membership.role,
            canManageTeam: isOwner,
            activeMembers: members.map((m) => this.formatMember(m)),
            pendingInvitations: invitations.map((inv) => this.formatInvitation(inv)),
            availableRoles: (0, organization_constants_1.rolesForOrgType)(orgType).filter((r) => r !== 'OWNER'),
        };
    }
    async inviteMember(userId, dto) {
        const { organization, membership } = await this.resolveOrganizationContext(userId);
        this.requireOwner(membership);
        const orgType = organization.type;
        if (!(0, organization_constants_1.isValidOrgRole)(orgType, dto.role)) {
            throw new common_1.BadRequestException(`Invalid role "${dto.role}" for ${orgType} organization`);
        }
        const email = dto.email.trim().toLowerCase();
        const owner = await this.prisma.user.findUnique({ where: { id: organization.owner_user_id } });
        if (owner?.email.toLowerCase() === email) {
            throw new common_1.BadRequestException('Cannot invite the organization owner');
        }
        const existingMember = await this.prisma.organizationMember.findFirst({
            where: {
                organization_id: organization.id,
                status: 'ACTIVE',
                user: { email: { equals: email, mode: 'insensitive' } },
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('User is already an active team member');
        }
        const pendingInvite = await this.prisma.organizationInvitation.findFirst({
            where: { organization_id: organization.id, email, status: 'PENDING' },
        });
        if (pendingInvite) {
            throw new common_1.BadRequestException('A pending invitation already exists for this email');
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + organization_constants_1.INVITATION_EXPIRY_DAYS);
        const invitation = await this.prisma.organizationInvitation.create({
            data: {
                organization_id: organization.id,
                email,
                role: dto.role,
                token: (0, crypto_1.randomUUID)(),
                invited_by_id: userId,
                expires_at: expiresAt,
            },
            include: { invited_by: { select: { name: true } } },
        });
        await this.createAuditLog(userId, 'ORG_MEMBER_INVITED', 'OrganizationInvitation', invitation.id, {
            email,
            role: dto.role,
            organizationId: organization.id,
        });
        const invitee = await this.prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
        });
        if (invitee) {
            await this.notifications.create({
                userId: invitee.id,
                title: 'Team invitation',
                message: `You have been invited to join ${organization.name} as ${organization_constants_1.ORG_ROLE_LABELS[dto.role] ?? dto.role}.`,
                type: 'TEAM',
                entityType: 'OrganizationInvitation',
                entityId: invitation.id,
                metadata: { token: invitation.token, organizationName: organization.name, role: dto.role },
            });
        }
        const formatted = this.formatInvitation(invitation);
        return {
            invitation: formatted,
            permissionPreview: { role: dto.role, permissions: (0, organization_constants_1.permissionsForRole)(orgType, dto.role) },
        };
    }
    async acceptInvitation(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const invitation = await this.prisma.organizationInvitation.findUnique({
            where: { token: dto.token },
            include: { organization: true },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation not found');
        if (invitation.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Invitation is ${invitation.status.toLowerCase()}`);
        }
        if (invitation.expires_at < new Date()) {
            await this.prisma.organizationInvitation.update({
                where: { id: invitation.id },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.BadRequestException('Invitation has expired');
        }
        if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            throw new common_1.ForbiddenException('Invitation email does not match your account');
        }
        const orgType = invitation.organization.type;
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
            throw new common_1.BadRequestException('You are already a member of this organization');
        }
        const member = await this.prisma.$transaction(async (tx) => {
            await tx.organizationInvitation.update({
                where: { id: invitation.id },
                data: { status: 'ACCEPTED', accepted_at: new Date() },
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
            message: `${user.name} accepted your team invitation and joined as ${organization_constants_1.ORG_ROLE_LABELS[invitation.role] ?? invitation.role}.`,
            type: 'TEAM',
            entityType: 'OrganizationMember',
            entityId: member.id,
        });
        return this.formatMember(member);
    }
    async changeMemberRole(userId, memberId, dto) {
        const { organization, membership } = await this.resolveOrganizationContext(userId);
        this.requireOwner(membership);
        const orgType = organization.type;
        if (!(0, organization_constants_1.isValidOrgRole)(orgType, dto.role)) {
            throw new common_1.BadRequestException(`Invalid role "${dto.role}" for ${orgType} organization`);
        }
        const member = await this.prisma.organizationMember.findFirst({
            where: { id: memberId, organization_id: organization.id, status: 'ACTIVE' },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
        if (!member)
            throw new common_1.NotFoundException('Team member not found');
        if (member.role === 'OWNER')
            throw new common_1.ForbiddenException('Cannot change the owner role');
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
            message: `Your role in ${organization.name} was changed to ${organization_constants_1.ORG_ROLE_LABELS[dto.role] ?? dto.role}.`,
            type: 'TEAM',
            entityType: 'OrganizationMember',
            entityId: member.id,
        });
        return this.formatMember(updated);
    }
    async removeMember(userId, memberId) {
        const { organization, membership } = await this.resolveOrganizationContext(userId);
        this.requireOwner(membership);
        const member = await this.prisma.organizationMember.findFirst({
            where: { id: memberId, organization_id: organization.id, status: 'ACTIVE' },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
        if (!member)
            throw new common_1.NotFoundException('Team member not found');
        if (member.role === 'OWNER')
            throw new common_1.ForbiddenException('Cannot remove the organization owner');
        if (member.user_id === userId)
            throw new common_1.BadRequestException('Cannot remove yourself');
        const updated = await this.prisma.organizationMember.update({
            where: { id: member.id },
            data: { status: 'REMOVED' },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
        await this.createAuditLog(userId, 'ORG_MEMBER_REMOVED', 'OrganizationMember', member.id, {
            memberEmail: member.user.email,
            role: member.role,
        });
        await this.notifications.create({
            userId: member.user_id,
            title: 'Removed from team',
            message: `You were removed from ${organization.name}.`,
            type: 'TEAM',
            entityType: 'OrganizationMember',
            entityId: member.id,
        });
        return { removed: true, member: this.formatMember({ ...updated, status: 'REMOVED' }) };
    }
    async reinviteMember(userId, targetId) {
        const { organization, membership } = await this.resolveOrganizationContext(userId);
        this.requireOwner(membership);
        const invitation = await this.prisma.organizationInvitation.findFirst({
            where: { id: targetId, organization_id: organization.id, status: 'PENDING' },
            include: { invited_by: { select: { name: true } } },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Pending invitation not found');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + organization_constants_1.INVITATION_EXPIRY_DAYS);
        const updated = await this.prisma.organizationInvitation.update({
            where: { id: invitation.id },
            data: { expires_at: expiresAt, token: (0, crypto_1.randomUUID)() },
            include: { invited_by: { select: { name: true } } },
        });
        await this.createAuditLog(userId, 'ORG_INVITATION_RESENT', 'OrganizationInvitation', invitation.id, {
            email: invitation.email,
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
        }
        return this.formatInvitation(updated);
    }
    async cancelInvitation(userId, invitationId) {
        const { organization, membership } = await this.resolveOrganizationContext(userId);
        this.requireOwner(membership);
        const invitation = await this.prisma.organizationInvitation.findFirst({
            where: { id: invitationId, organization_id: organization.id, status: 'PENDING' },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Pending invitation not found');
        const updated = await this.prisma.organizationInvitation.update({
            where: { id: invitation.id },
            data: { status: 'CANCELLED' },
            include: { invited_by: { select: { name: true } } },
        });
        await this.createAuditLog(userId, 'ORG_INVITATION_CANCELLED', 'OrganizationInvitation', invitation.id, {
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
    getRolePermissions(orgType, role) {
        return { role, permissions: (0, organization_constants_1.permissionsForRole)(orgType, role) };
    }
    async getMyInvitations(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
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
    async resolveOrganizationContext(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true, brand_profile: true, creator_profile: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const roleName = user.role?.name ?? '';
        const activeMemberships = await this.prisma.organizationMember.findMany({
            where: { user_id: userId, status: 'ACTIVE' },
            include: { organization: true },
            orderBy: { joined_at: 'asc' },
        });
        if (activeMemberships.length > 0) {
            const preferred = activeMemberships.find((m) => m.organization.type === 'BRAND' && ['BRAND', 'ADMIN', 'SUPER_ADMIN'].includes(roleName)) ??
                activeMemberships.find((m) => m.organization.type === 'CREATOR' && roleName === 'CREATOR') ??
                activeMemberships.find((m) => m.organization.owner_user_id === userId) ??
                activeMemberships[0];
            return { organization: preferred.organization, membership: preferred };
        }
        let orgType = null;
        if (['BRAND', 'ADMIN', 'SUPER_ADMIN'].includes(roleName)) {
            orgType = 'BRAND';
        }
        else if (roleName === 'CREATOR') {
            orgType = 'CREATOR';
        }
        if (!orgType) {
            throw new common_1.ForbiddenException('No organization context found for this user');
        }
        const organization = await this.ensureOrganization(user, orgType);
        const membership = await this.prisma.organizationMember.findUnique({
            where: {
                organization_id_user_id: { organization_id: organization.id, user_id: userId },
            },
        });
        if (!membership || membership.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('You are not an active member of this organization');
        }
        return { organization, membership };
    }
    async ensureOrganization(user, orgType) {
        if (orgType === 'BRAND') {
            const profile = user.brand_profile ??
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
        const profile = user.creator_profile ??
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
    async ensureProfileForOrgType(userId, userName, orgType, orgName) {
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
    requireOwner(membership) {
        if (membership.role !== 'OWNER') {
            throw new common_1.ForbiddenException('Only the organization owner can perform this action');
        }
    }
    async touchLastActive(memberId) {
        await this.prisma.organizationMember.update({
            where: { id: memberId },
            data: { last_active_at: new Date() },
        }).catch(() => undefined);
    }
    formatMember(member) {
        return {
            id: member.id,
            userId: member.user_id,
            name: member.user.name,
            email: member.user.email,
            avatar: member.user.avatar,
            role: member.role,
            roleLabel: organization_constants_1.ORG_ROLE_LABELS[member.role] ?? member.role,
            status: member.status,
            lastActiveAt: member.last_active_at?.toISOString() ?? null,
            joinedAt: member.joined_at.toISOString(),
            isOwner: member.role === 'OWNER',
        };
    }
    formatInvitation(inv) {
        return {
            id: inv.id,
            email: inv.email,
            role: inv.role,
            roleLabel: organization_constants_1.ORG_ROLE_LABELS[inv.role] ?? inv.role,
            status: inv.status,
            invitedBy: inv.invited_by?.name ?? 'Unknown',
            expiresAt: inv.expires_at.toISOString(),
            createdAt: inv.created_at.toISOString(),
        };
    }
    async createAuditLog(actorId, action, entity, entityId, metadata) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    admin_id: actorId,
                    action,
                    entity,
                    entity_id: entityId,
                    metadata: (metadata ?? {}),
                },
            });
        }
        catch (e) {
            console.error('AuditLog write failed:', e);
        }
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map