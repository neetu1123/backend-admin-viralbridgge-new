import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { FirebaseSecurityService } from './firebase-security.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SecurityController],
  providers: [SecurityService, FirebaseSecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
