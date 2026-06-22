import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationController } from './organization.controller';
import { OrganizationPublicController } from './organization-public.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [OrganizationController, OrganizationPublicController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
