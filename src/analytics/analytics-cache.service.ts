import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ANALYTICS_CACHE_TTL_SECONDS } from './analytics.constants';

@Injectable()
export class AnalyticsCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsCacheService.name);
  private redis: Redis | null = null;
  private readonly memory = new Map<string, { value: string; expiresAt: number }>();

  private getRedis(): Redis | null {
    if (process.env.VERCEL) return null;
    if (this.redis) return this.redis;
    const url = process.env.REDIS_URL?.trim();
    if (!url) return null;
    try {
      this.redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
      this.redis.connect().catch(() => {
        this.logger.warn('Redis unavailable for analytics cache; using in-memory fallback.');
        this.redis = null;
      });
      return this.redis;
    } catch {
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = this.getRedis();
    if (redis) {
      try {
        const raw = await redis.get(key);
        if (raw) return JSON.parse(raw) as T;
      } catch {
        // fall through to memory
      }
    }
    const entry = this.memory.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds = ANALYTICS_CACHE_TTL_SECONDS): Promise<void> {
    const serialized = JSON.stringify(value);
    const redis = this.getRedis();
    if (redis) {
      try {
        await redis.set(key, serialized, 'EX', ttlSeconds);
        return;
      } catch {
        // fall through
      }
    }
    this.memory.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  cacheKey(prefix: string, parts: Record<string, string | undefined>): string {
    const segment = Object.entries(parts)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `analytics:${prefix}:${segment}`;
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit().catch(() => undefined);
    }
  }
}
