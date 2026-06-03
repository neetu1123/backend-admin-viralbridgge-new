import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const server = express();
let cachedHandler: ReturnType<typeof serverless> | undefined;

async function bootstrapServerless() {
  if (cachedHandler) return cachedHandler;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log'],
  });
  configureApp(app);
  await app.init();

  cachedHandler = serverless(server);
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const serverlessHandler = await bootstrapServerless();
  return serverlessHandler(req, res);
}
