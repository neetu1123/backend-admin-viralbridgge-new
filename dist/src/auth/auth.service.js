"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const security_service_1 = require("../security/security.service");
const user_provisioning_service_1 = require("../users/user-provisioning.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    userProvisioning;
    securityService;
    constructor(prisma, jwtService, userProvisioning, securityService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.userProvisioning = userProvisioning;
        this.securityService = securityService;
    }
    async signToken(user) {
        const jti = (0, crypto_1.randomUUID)();
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role?.name,
            jti,
        };
        return {
            access_token: await this.jwtService.signAsync(payload),
            jti,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role?.name,
            },
        };
    }
    async register(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const roleName = String(data.role || 'CREATOR').toUpperCase();
        const role = await this.prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName, description: `${roleName} role` },
        });
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role_id: role.id,
            },
            include: { role: true },
        });
        await this.userProvisioning.provisionUserResources(user.id, roleName, data.name);
        if (roleName === 'BRAND') {
            await this.prisma.brandProfile.create({
                data: { user_id: user.id, company_name: data.name },
            });
        }
        if (roleName === 'CREATOR') {
            await this.prisma.creatorProfile.create({
                data: { user_id: user.id, full_name: data.name, languages: [] },
            });
        }
        const token = await this.signToken(user);
        return {
            access_token: token.access_token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role?.name },
        };
    }
    async login(data, meta) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
            include: { role: true },
        });
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const token = await this.signToken(user);
        if (meta) {
            await this.securityService.recordLogin(user.id, token.jti, meta).catch((error) => {
                console.error('Failed to record login session:', error);
            });
        }
        return {
            access_token: token.access_token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role?.name },
        };
    }
    async logout(userId, jti, exp) {
        if (jti) {
            const expiresAt = exp
                ? new Date(exp * 1000)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await this.prisma.revokedToken.upsert({
                where: { jti },
                update: {},
                create: { jti, user_id: userId, expires_at: expiresAt },
            });
            await this.prisma.revokedToken.deleteMany({
                where: { expires_at: { lt: new Date() } },
            });
        }
        return { success: true, message: 'Logged out successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => security_service_1.SecurityService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        user_provisioning_service_1.UserProvisioningService,
        security_service_1.SecurityService])
], AuthService);
//# sourceMappingURL=auth.service.js.map