import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserActivityService } from './user-activity.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [UserActivityService],
  exports: [UserActivityService],
})
export class UserActivityModule {}
