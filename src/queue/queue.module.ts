import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

function redisConnection() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return null;

  let url: URL;
  try {
    url = new URL(redisUrl);
  } catch {
    console.warn('Invalid REDIS_URL; BullMQ disabled.');
    return null;
  }
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
  };
}

@Module({})
export class QueueModule {
  static register(): DynamicModule {
    if (process.env.VERCEL) {
      return { module: QueueModule };
    }

    const connection = redisConnection();
    if (!connection) {
      return { module: QueueModule };
    }

    return {
      module: QueueModule,
      imports: [BullModule.forRoot({ connection })],
      exports: [BullModule],
    };
  }
}
