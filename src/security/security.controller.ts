import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { extractClientIp } from './security-session.helper';
import {
  Confirm2FaDto,
  ChangePasswordDto,
  Enable2FaDto,
  SecurityActivityQueryDto,
  SecurityActivityResponseDto,
  SecuritySettingsResponseDto,
  SignOutAllDto,
  TwoFactorStatusResponseDto,
  UserSessionResponseDto,
} from './security.dto';
import { SecurityService } from './security.service';

type SecurityRequest = {
  user: { id: string };
  jwtPayload?: { jti?: string };
  headers: Record<string, string | string[] | undefined>;
};

function sessionMeta(req: SecurityRequest) {
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
  return {
    ipAddress: extractClientIp(req.headers),
    userAgent,
    location: 'Unknown',
  };
}

@ApiTags('Security')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get security settings overview' })
  @ApiResponse({ status: 200, type: SecuritySettingsResponseDto })
  getSettings(@Request() req: SecurityRequest) {
    return this.securityService.getSettings(req.user.id);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password (requires current password)' })
  changePassword(@Request() req: SecurityRequest, @Body() body: ChangePasswordDto) {
    return this.securityService.changePassword(req.user.id, body, sessionMeta(req));
  }

  @Get('2fa/status')
  @ApiOperation({ summary: 'Get two-factor authentication status' })
  @ApiResponse({ status: 200, type: TwoFactorStatusResponseDto })
  get2FaStatus(@Request() req: SecurityRequest) {
    return this.securityService.get2FaStatus(req.user.id);
  }

  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable 2FA (SMS) — stores phone and syncs Firebase MFA state' })
  enable2Fa(@Request() req: SecurityRequest, @Body() body: Enable2FaDto) {
    return this.securityService.enable2Fa(req.user.id, body, sessionMeta(req));
  }

  @Post('2fa/confirm')
  @ApiOperation({ summary: 'Confirm 2FA after client-side Firebase MFA enrollment' })
  confirm2Fa(@Request() req: SecurityRequest, @Body() body: Confirm2FaDto) {
    return this.securityService.confirm2Fa(req.user.id, body, sessionMeta(req));
  }

  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA' })
  disable2Fa(@Request() req: SecurityRequest) {
    return this.securityService.disable2Fa(req.user.id, sessionMeta(req));
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions' })
  @ApiResponse({ status: 200, type: [UserSessionResponseDto] })
  listSessions(@Request() req: SecurityRequest) {
    return this.securityService.listSessions(req.user.id, req.jwtPayload?.jti);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Remove a session (not the current session)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  removeSession(@Request() req: SecurityRequest, @Param('id') id: string) {
    return this.securityService.removeSession(req.user.id, id, req.jwtPayload?.jti, sessionMeta(req));
  }

  @Post('signout-all')
  @ApiOperation({ summary: 'Sign out all devices' })
  signOutAll(@Request() req: SecurityRequest, @Body() body: SignOutAllDto) {
    return this.securityService.signOutAll(req.user.id, body, req.jwtPayload?.jti, sessionMeta(req));
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get security activity log (paginated)' })
  @ApiResponse({ status: 200, type: [SecurityActivityResponseDto] })
  listActivity(@Request() req: SecurityRequest, @Query() query: SecurityActivityQueryDto) {
    return this.securityService.listActivity(req.user.id, query);
  }
}
