import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = await this.resolveUser(token);

      if (user.is_banned || user.is_deleted) {
        throw new ForbiddenException('User is banned or deleted');
      }

      request['user'] = user; // Populated DB user

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles) {
        return true;
      }

      return requiredRoles.includes(user.role?.name || '');

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async resolveUser(token: string) {
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
      throw new UnauthorizedException('User not found in database');
    }

    return user;
  }

  private async tryResolveFirebaseUser(token: string) {
    try {
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
    } catch {
      return null;
    }
  }

  private async ensureWallet(userId: string) {
    await this.prisma.wallet.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
