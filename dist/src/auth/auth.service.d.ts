import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import type { SessionMeta } from '../security/security-session.helper';
export declare class AuthService {
    private prisma;
    private jwtService;
    private securityService;
    constructor(prisma: PrismaService, jwtService: JwtService, securityService: SecurityService);
    private signToken;
    register(data: any): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string | undefined;
        };
    }>;
    login(data: any, meta?: SessionMeta): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string | undefined;
        };
    }>;
    logout(userId: string, jti?: string, exp?: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
