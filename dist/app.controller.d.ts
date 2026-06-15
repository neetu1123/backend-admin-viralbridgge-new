import { AppService } from './app.service';
import { MatchingService } from './matching/matching.service';
export declare class AppController {
    private readonly appService;
    private readonly matchingService;
    constructor(appService: AppService, matchingService: MatchingService);
    getHello(): string;
    health(): {
        status: string;
        service: string;
        vercel: boolean;
    };
    getPublicSettings(): Promise<{
        aiMatchingEnabled: boolean;
    }>;
}
