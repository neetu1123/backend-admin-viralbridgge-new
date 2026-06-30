import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DeliverablesService } from '../payments/deliverables.service';

export const ESCROW_AUTO_RELEASE_QUEUE = 'escrow-auto-release';

@Processor(ESCROW_AUTO_RELEASE_QUEUE)
export class EscrowAutoReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(EscrowAutoReleaseProcessor.name);

  constructor(private readonly deliverablesService: DeliverablesService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'run-auto-release') return;
    const result = await this.deliverablesService.processAutoReleases();
    if (result.processed > 0) {
      this.logger.log(`Auto-released ${result.processed} escrow(s) via BullMQ`);
    }
    return result;
  }
}
