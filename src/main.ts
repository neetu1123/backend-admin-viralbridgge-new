/**
 * Local / VPS entrypoint only.
 * Vercel uses api/index.ts (serverless handler) — do not call app.listen() there.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await configureApp(app);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
