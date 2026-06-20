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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const security_session_helper_1 = require("./security-session.helper");
const security_dto_1 = require("./security.dto");
const security_service_1 = require("./security.service");
function sessionMeta(req) {
    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
    return {
        ipAddress: (0, security_session_helper_1.extractClientIp)(req.headers),
        userAgent,
        location: 'Unknown',
    };
}
let SecurityController = class SecurityController {
    securityService;
    constructor(securityService) {
        this.securityService = securityService;
    }
    getSettings(req) {
        return this.securityService.getSettings(req.user.id);
    }
    changePassword(req) {
        return this.securityService.changePassword(req.user.id, sessionMeta(req));
    }
    get2FaStatus(req) {
        return this.securityService.get2FaStatus(req.user.id);
    }
    enable2Fa(req, body) {
        return this.securityService.enable2Fa(req.user.id, body, sessionMeta(req));
    }
    confirm2Fa(req, body) {
        return this.securityService.confirm2Fa(req.user.id, body, sessionMeta(req));
    }
    disable2Fa(req) {
        return this.securityService.disable2Fa(req.user.id, sessionMeta(req));
    }
    listSessions(req) {
        return this.securityService.listSessions(req.user.id, req.jwtPayload?.jti);
    }
    removeSession(req, id) {
        return this.securityService.removeSession(req.user.id, id, req.jwtPayload?.jti, sessionMeta(req));
    }
    signOutAll(req, body) {
        return this.securityService.signOutAll(req.user.id, body, req.jwtPayload?.jti, sessionMeta(req));
    }
    listActivity(req, query) {
        return this.securityService.listActivity(req.user.id, query);
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get security settings overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: security_dto_1.SecuritySettingsResponseDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Send Firebase password reset email' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('2fa/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get two-factor authentication status' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: security_dto_1.TwoFactorStatusResponseDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "get2FaStatus", null);
__decorate([
    (0, common_1.Post)('2fa/enable'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable 2FA (SMS) — stores phone and syncs Firebase MFA state' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, security_dto_1.Enable2FaDto]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "enable2Fa", null);
__decorate([
    (0, common_1.Post)('2fa/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm 2FA after client-side Firebase MFA enrollment' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, security_dto_1.Confirm2FaDto]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "confirm2Fa", null);
__decorate([
    (0, common_1.Post)('2fa/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable 2FA' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "disable2Fa", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'List active sessions' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [security_dto_1.UserSessionResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Delete)('sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a session (not the current session)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Session ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "removeSession", null);
__decorate([
    (0, common_1.Post)('signout-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign out all devices' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, security_dto_1.SignOutAllDto]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "signOutAll", null);
__decorate([
    (0, common_1.Get)('activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get security activity log (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [security_dto_1.SecurityActivityResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, security_dto_1.SecurityActivityQueryDto]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "listActivity", null);
exports.SecurityController = SecurityController = __decorate([
    (0, swagger_1.ApiTags)('Security'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'),
    (0, common_1.Controller)('security'),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map