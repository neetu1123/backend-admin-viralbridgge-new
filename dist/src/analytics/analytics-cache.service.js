"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AnalyticsCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsCacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const analytics_constants_1 = require("./analytics.constants");
let AnalyticsCacheService = AnalyticsCacheService_1 = class AnalyticsCacheService {
    logger = new common_1.Logger(AnalyticsCacheService_1.name);
    redis = null;
    memory = new Map();
    getRedis() {
        if (process.env.VERCEL)
            return null;
        if (this.redis)
            return this.redis;
        const url = process.env.REDIS_URL?.trim();
        if (!url)
            return null;
        try {
            this.redis = new ioredis_1.default(url, { maxRetriesPerRequest: 1, lazyConnect: true });
            this.redis.connect().catch(() => {
                this.logger.warn('Redis unavailable for analytics cache; using in-memory fallback.');
                this.redis = null;
            });
            return this.redis;
        }
        catch {
            return null;
        }
    }
    async get(key) {
        const redis = this.getRedis();
        if (redis) {
            try {
                const raw = await redis.get(key);
                if (raw)
                    return JSON.parse(raw);
            }
            catch {
            }
        }
        const entry = this.memory.get(key);
        if (!entry || entry.expiresAt < Date.now()) {
            this.memory.delete(key);
            return null;
        }
        return JSON.parse(entry.value);
    }
    async set(key, value, ttlSeconds = analytics_constants_1.ANALYTICS_CACHE_TTL_SECONDS) {
        const serialized = JSON.stringify(value);
        const redis = this.getRedis();
        if (redis) {
            try {
                await redis.set(key, serialized, 'EX', ttlSeconds);
                return;
            }
            catch {
            }
        }
        this.memory.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    cacheKey(prefix, parts) {
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
};
exports.AnalyticsCacheService = AnalyticsCacheService;
exports.AnalyticsCacheService = AnalyticsCacheService = AnalyticsCacheService_1 = __decorate([
    (0, common_1.Injectable)()
], AnalyticsCacheService);
//# sourceMappingURL=analytics-cache.service.js.map