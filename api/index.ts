import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const server = express();
let cachedHandler: ReturnType<typeof serverless> | undefined;
let bootstrapPromise: Promise<ReturnType<typeof serverless>> | undefined;

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
  try {
    const serverlessHandler = await bootstrapServerless();
    return serverlessHandler(req, res);
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
