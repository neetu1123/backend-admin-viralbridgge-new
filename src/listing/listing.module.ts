import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DiscoveryModule } from '../discovery/discovery.module';
import { StorageModule } from '../storage/storage.module';
import { ListingService } from './listing.service';
import { ListingPublicController } from './listing-public.controller';
import { ListingOwnerController } from './listing-owner.controller';
import { AdminListingController } from './admin-listing.controller';

@Module({
  imports: [PrismaModule, NotificationsModule, DiscoveryModule, StorageModule],
  controllers: [ListingPublicController, ListingOwnerController, AdminListingController],
  providers: [ListingService],
  exports: [ListingService],
})
export class ListingModule {}
