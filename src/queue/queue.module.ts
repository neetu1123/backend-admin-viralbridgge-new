import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

function redisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  const url = new URL(redisUrl);
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
