import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const server = express();
let cachedHandler: ReturnType<typeof serverless> | undefined;
let bootstrapPromise: Promise<ReturnType<typeof serverless>> | undefined;

function requestPath(url: string | undefined): string {
  const raw = url ?? '/';
  return raw.split('?')[0] || '/';
}

function isFastPath(path: string): boolean {
  return path === '/' || path === '/health';
}

server.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'viralbridge-api',
    warmed: Boolean(cachedHandler),
    vercel: Boolean(process.env.VERCEL),
  });
});

server.get('/', (_req, res) => {
  res.json({
    success: true,
    data: 'ViralBridge API is running',
  });
});

async function bootstrapServerless() {
  if (cachedHandler) return cachedHandler;
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
        logger: ['error', 'warn', 'log'],
      });
      configureApp(app);
      await app.init();
      cachedHandler = serverless(server, { binary: true });
      return cachedHandler;
    })();
  }
  return bootstrapPromise;
}

export default async function handler(req: express.Request, res: express.Response) {
  const path = requestPath(req.url);

  if (isFastPath(path)) {
    server(req, res);
    return;
  }

  try {
    const serverlessHandler = await bootstrapServerless();
    await serverlessHandler(req, res);
  } catch (error) {
    console.error('Vercel handler bootstrap failed:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'API failed to start',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
