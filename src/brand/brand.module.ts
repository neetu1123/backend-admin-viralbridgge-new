import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchingModule } from '../matching/matching.module';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

@Module({
  imports: [PrismaModule, MatchingModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
