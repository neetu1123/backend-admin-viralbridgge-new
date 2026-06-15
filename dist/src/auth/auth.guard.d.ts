import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthGuard implements CanActivate {
    private reflector;
    private prisma;
    private jwtService;
    constructor(reflector: Reflector, prisma: PrismaService, jwtService: JwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private resolveUser;
    private tryResolveFirebaseUser;
    private ensureWallet;
    private extractTokenFromHeader;
}
