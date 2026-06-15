import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MatchingModule } from '../matching/matching.module';
import { KycModule } from '../kyc/kyc.module';

@Module({
  imports: [MatchingModule, KycModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
