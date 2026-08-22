import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { CrmEnhancementService } from './crm-enhancement.service';

@Module({
  imports: [PrismaModule],
  controllers: [CrmController],
  providers: [CrmService, CrmEnhancementService],
  exports: [CrmService, CrmEnhancementService],
})
export class CrmModule {}
