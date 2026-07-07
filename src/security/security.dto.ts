import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'brand@1234' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePass1!' })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  newPassword: string;
}

export class DeactivateAccountDto {
  @ApiProperty({ example: 'brand@1234' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'DELETE' })
  @IsString()
  @IsNotEmpty()
  confirmation: string;
}

export class Enable2FaDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'Phone number must be a valid E.164 format' })
  phoneNumber: string;
}

export class Confirm2FaDto {
  @ApiPropertyOptional({ description: 'Set true after completing Firebase MFA enrollment on the client' })
  @IsOptional()
  @IsBoolean()
  firebaseMfaCompleted?: boolean;
}

export class SignOutAllDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  signOutCurrentDevice?: boolean;
}

export class SecurityActivityQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class SecuritySettingsResponseDto {
  @ApiProperty()
  twoFactorEnabled: boolean;

  @ApiPropertyOptional()
  twoFactorType?: string | null;

  @ApiPropertyOptional()
  phoneNumber?: string | null;

  @ApiPropertyOptional()
  lastPasswordChange?: string | null;

  @ApiProperty()
  activeSessionCount: number;
}

export class TwoFactorStatusResponseDto {
  @ApiProperty()
  enabled: boolean;

  @ApiPropertyOptional()
  type?: string | null;

  @ApiPropertyOptional()
  phoneNumber?: string | null;

  @ApiProperty()
  pendingEnrollment: boolean;
}

export class UserSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  deviceName?: string | null;

  @ApiPropertyOptional()
  browser?: string | null;

  @ApiPropertyOptional()
  ipAddress?: string | null;

  @ApiPropertyOptional()
  location?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty()
  lastActive: string;

  @ApiProperty()
  createdAt: string;
}

export class SecurityActivityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional()
  device?: string | null;

  @ApiPropertyOptional()
  browser?: string | null;

  @ApiPropertyOptional()
  ipAddress?: string | null;

  @ApiPropertyOptional()
  location?: string | null;

  @ApiProperty()
  createdAt: string;
}
