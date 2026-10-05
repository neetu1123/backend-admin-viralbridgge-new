import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DiscoveryController } from './discovery.controller';
import { AdminDiscoveryController } from './admin-discovery.controller';
import { DiscoveryService } from './discovery.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [DiscoveryController, AdminDiscoveryController],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
