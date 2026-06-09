import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchingModule } from '../matching/matching.module';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';

@Module({
  imports: [PrismaModule, MatchingModule],
  controllers: [CreatorController],
  providers: [CreatorService],
})
export class CreatorModule {}
