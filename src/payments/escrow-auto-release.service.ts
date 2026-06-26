import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';

const AUTO_RELEASE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class EscrowAutoReleaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EscrowAutoReleaseService.name);
  private intervalRef: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly deliverablesService: DeliverablesService) {}

  onModuleInit() {
    if (process.env.VERCEL || process.env.DISABLE_ESCROW_AUTO_RELEASE === 'true') {
      return;
    }

    this.intervalRef = setInterval(() => {
      void this.runAutoRelease();
    }, AUTO_RELEASE_INTERVAL_MS);

    void this.runAutoRelease();
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  async runAutoRelease() {
    try {
      const result = await this.deliverablesService.processAutoReleases();
      if (result.processed > 0) {
        this.logger.log(`Auto-released ${result.processed} escrow(s)`);
      }
    } catch (err) {
      this.logger.error('Escrow auto-release failed', err);
    }
  }
}
