import { OnModuleDestroy } from '@nestjs/common';
export declare class AnalyticsCacheService implements OnModuleDestroy {
    private readonly logger;
    private redis;
    private readonly memory;
    private getRedis;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    cacheKey(prefix: string, parts: Record<string, string | undefined>): string;
    onModuleDestroy(): Promise<void>;
}
