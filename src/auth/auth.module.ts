import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';
import { ReEngagementModule } from '../re-engagement/re-engagement.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ReEngagementModule,
    forwardRef(() => SecurityModule),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
  })
export class AuthModule {}
