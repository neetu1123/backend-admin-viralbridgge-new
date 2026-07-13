import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReEngagementService } from '../re-engagement/re-engagement.service';

export const RE_ENGAGEMENT_QUEUE = 're-engagement';

@Processor(RE_ENGAGEMENT_QUEUE)
export class ReEngagementProcessor extends WorkerHost {
  private readonly logger = new Logger(ReEngagementProcessor.name);

  constructor(private readonly reEngagement: ReEngagementService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'run-re-engagement') return;
    const result = await this.reEngagement.processInactiveUsers();
    this.logger.log(`Re-engagement job sent ${result.sent} email(s)`);
    return result;
  }
}
