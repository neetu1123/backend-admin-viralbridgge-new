import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { BrandModule } from './brand/brand.module';
import { CreatorModule } from './creator/creator.module';
import { QueueModule } from './queue/queue.module';
import { MatchingModule } from './matching/matching.module';
import { NotificationsModule } from './notifications/notifications.module';
import { KycModule } from './kyc/kyc.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    NotificationsModule,
    MatchingModule,
    KycModule,
    PaymentsModule,
    QueueModule.register(),
    AuthModule,
    UsersModule,
    AdminModule,
    BrandModule,
    CreatorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...(process.env.VERCEL
      ? []
      : [require('./app.gateway').AppGateway]),
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
