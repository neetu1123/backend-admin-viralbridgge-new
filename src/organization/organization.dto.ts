import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import {
  BRAND_ORG_ROLES,
  CREATOR_ORG_ROLES,
  ORGANIZATION_TYPES,
} from './organization.constants';
import type { OrganizationType } from './organization.constants';

const INVITABLE_BRAND_ROLES = BRAND_ORG_ROLES.filter((r) => r !== 'OWNER');
const INVITABLE_CREATOR_ROLES = CREATOR_ORG_ROLES.filter((r) => r !== 'OWNER');
const ALL_INVITABLE_ROLES = [...INVITABLE_BRAND_ROLES, ...INVITABLE_CREATOR_ROLES];

export class InviteMemberDto {
  @ApiProperty({ example: 'member@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ALL_INVITABLE_ROLES, example: 'CAMPAIGN_MANAGER' })
  @IsString()
  @IsIn(ALL_INVITABLE_ROLES as unknown as string[])
  role: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token from email or invite link' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ChangeMemberRoleDto {
  @ApiProperty({ enum: ALL_INVITABLE_ROLES, example: 'VIEWER' })
  @IsString()
  @IsIn(ALL_INVITABLE_ROLES as unknown as string[])
  role: string;
}

export class TeamMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatar?: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty()
  roleLabel: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  lastActiveAt?: string | null;

  @ApiProperty()
  joinedAt: string;

  @ApiProperty()
  isOwner: boolean;
}

export class PendingInvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  roleLabel: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  invitedBy: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty()
  createdAt: string;
}

export class TeamResponseDto {
  @ApiProperty({ enum: ORGANIZATION_TYPES })
  organizationType: OrganizationType;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty()
  currentUserRole: string;

  @ApiProperty()
  canManageTeam: boolean;

  @ApiProperty({ type: [TeamMemberResponseDto] })
  activeMembers: TeamMemberResponseDto[];

  @ApiProperty({ type: [PendingInvitationResponseDto] })
  pendingInvitations: PendingInvitationResponseDto[];

  @ApiProperty({ type: [String] })
  availableRoles: string[];
}

export class RolePermissionsDto {
  @ApiProperty()
  role: string;

  @ApiProperty({ type: [String] })
  permissions: string[];
}

export class InviteMemberResponseDto {
  @ApiProperty()
  invitation: PendingInvitationResponseDto;

  @ApiProperty({ type: RolePermissionsDto })
  permissionPreview: RolePermissionsDto;
}
