import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MatchingService } from './matching/matching.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly matchingService: MatchingService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'viralbridge-api',
      vercel: Boolean(process.env.VERCEL),
    };
  }

  @Get('settings/public')
  getPublicSettings() {
    return this.matchingService.getOrCreatePlatformSettings().then((s) => ({
      aiMatchingEnabled: s.ai_matching_enabled,
    }));
  }
}
