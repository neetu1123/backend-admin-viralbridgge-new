import { Module } from '@nestjs/common';
import { UserProvisioningService } from './user-provisioning.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserProvisioningService],
  exports: [UserProvisioningService],
})
export class UsersModule {}
