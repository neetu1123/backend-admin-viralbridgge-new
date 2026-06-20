import { Injectable, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import type { SessionMeta } from '../security/security-session.helper';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => SecurityService))
    private securityService: SecurityService,
  ) {}

  private async signToken(user: { id: string; email: string; name?: string; role?: { name: string } | null }) {
    const jti = randomUUID();
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

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
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
        wallets: { create: {} },
      },
      include: { role: true },
    });

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

  async login(data: any, meta?: SessionMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
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

  async logout(userId: string, jti?: string, exp?: number) {
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
}
