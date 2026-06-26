import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';
export declare class EscrowAutoReleaseService implements OnModuleInit, OnModuleDestroy {
    private readonly deliverablesService;
    private readonly logger;
    private intervalRef;
    constructor(deliverablesService: DeliverablesService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    runAutoRelease(): Promise<void>;
}
