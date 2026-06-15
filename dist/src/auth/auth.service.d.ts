import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    login(data: any): Promise<{
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
