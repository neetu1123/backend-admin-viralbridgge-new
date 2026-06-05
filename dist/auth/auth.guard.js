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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const roles_decorator_1 = require("./roles.decorator");
let AuthGuard = class AuthGuard {
    reflector;
    prisma;
    jwtService;
    constructor(reflector, prisma, jwtService) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const user = await this.resolveUser(token);
            if (user.is_banned || user.is_deleted) {
                throw new common_1.ForbiddenException('User is banned or deleted');
            }
            request['user'] = user;
            const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (!requiredRoles) {
                return true;
            }
            return requiredRoles.includes(user.role?.name || '');
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
    async resolveUser(token) {
        const firebaseUser = await this.tryResolveFirebaseUser(token);
        if (firebaseUser) {
            return firebaseUser;
        }
        const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026',
        });
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { role: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found in database');
        }
        return user;
    }
    async tryResolveFirebaseUser(token) {
        try {
            if (!process.env.FIREBASE_SERVICE_ACCOUNT?.trim()) {
                return null;
            }
            const admin = await import('firebase-admin');
            if (!admin.apps.length) {
                return null;
            }
            const decoded = await admin.auth().verifyIdToken(token);
            const roleName = String(decoded.role || decoded.user_role || 'CREATOR').toUpperCase();
            const role = await this.prisma.role.upsert({
                where: { name: roleName },
                update: {},
                create: { name: roleName, description: `${roleName} role` },
            });
            const email = decoded.email ?? `${decoded.uid}@firebase.local`;
            const user = await this.prisma.user.upsert({
                where: { firebase_uid: decoded.uid },
                update: {
                    email,
                    name: decoded.name ?? decoded.email ?? 'ViralBridge User',
                    avatar: decoded.picture,
                    role_id: role.id,
                    is_verified: Boolean(decoded.email_verified),
                },
                create: {
                    firebase_uid: decoded.uid,
                    email,
                    name: decoded.name ?? decoded.email ?? 'ViralBridge User',
                    avatar: decoded.picture,
                    role_id: role.id,
                    is_verified: Boolean(decoded.email_verified),
                    status: 'ACTIVE',
                },
                include: { role: true },
            });
            await this.ensureWallet(user.id);
            return user;
        }
        catch {
            return null;
        }
    }
    async ensureWallet(userId) {
        await this.prisma.wallet.upsert({
            where: { user_id: userId },
            update: {},
            create: { user_id: userId },
        });
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map