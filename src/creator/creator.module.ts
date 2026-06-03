import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';

@Module({
  imports: [PrismaModule],
  controllers: [CreatorController],
  providers: [CreatorService],
})
export class CreatorModule {}
