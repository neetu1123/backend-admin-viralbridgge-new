import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';

const server = express();
const BOOTSTRAP_TIMEOUT_MS = 9000;

const DEFAULT_ORIGINS =
  'http://localhost:3000,http://localhost:3002,https://admin-viralbridgge-new.vercel.app';

let cachedHandler: ReturnType<typeof serverless> | undefined;
let bootstrapPromise: Promise<ReturnType<typeof serverless>> | undefined;

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGINS || DEFAULT_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function setCorsHeaders(req: express.Request, res: express.Response): void {
  const origin = req.headers.origin;
  const allowed = getAllowedOrigins();

  if (typeof origin === 'string' && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

server.use((req, res, next) => {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

function requestPath(url: string | undefined): string {
  const raw = url ?? '/';
  return raw.split('?')[0] || '/';
}

function isFastPath(path: string): boolean {
  return path === '/' || path === '/health';
}

function warmNestInBackground(): void {
  if (cachedHandler || bootstrapPromise) return;
  bootstrapServerless().catch((error) => {
    console.error('Background Nest warm-up failed:', error);
  });
}

server.get('/health', (_req, res) => {
  warmNestInBackground();
  res.json({
    status: 'ok',
    service: 'viralbridge-api',
    warmed: Boolean(cachedHandler),
    warming: Boolean(bootstrapPromise && !cachedHandler),
    vercel: Boolean(process.env.VERCEL),
  });
});

server.get('/', (_req, res) => {
  warmNestInBackground();
  res.json({
    success: true,
    data: 'ViralBridge API is running',
  });
});

async function bootstrapServerless() {
  if (cachedHandler) return cachedHandler;
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const { AppModule } = require('../dist/app.module') as typeof import('../dist/app.module');
      const { configureApp } = require('../dist/bootstrap') as typeof import('../dist/bootstrap');

      const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
        logger: process.env.VERCEL ? false : ['error', 'warn', 'log'],
      });
      await configureApp(app);
      await app.init();
      cachedHandler = serverless(server, { binary: true });
      return cachedHandler;
    })();
  }
  return bootstrapPromise;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('BOOTSTRAP_TIMEOUT')), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export default async function handler(req: express.Request, res: express.Response) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const path = requestPath(req.url);

  if (isFastPath(path)) {
    server(req, res);
    return;
  }

  if (path === '/auth/login' && req.method === 'GET') {
    warmNestInBackground();
    res.status(405).json({
      success: false,
      statusCode: 405,
      message: 'Use POST /auth/login with JSON body: { "email": "...", "password": "..." }',
    });
    return;
  }

  try {
    const serverlessHandler = await withTimeout(bootstrapServerless(), BOOTSTRAP_TIMEOUT_MS);
    await serverlessHandler(req, res);
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOTSTRAP_TIMEOUT') {
      warmNestInBackground();
      if (!res.headersSent) {
        res.setHeader('Retry-After', '5');
        res.status(503).json({
          success: false,
          statusCode: 503,
          message: 'API is starting up. Wait a few seconds and try again.',
          timestamp: new Date().toISOString(),
        });
      }
      return;
    }

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
