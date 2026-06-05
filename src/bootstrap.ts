import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as admin from 'firebase-admin';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';

export function initializeFirebaseAdmin() {
  if (admin.apps.length) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!serviceAccountJson) {
    // Do not call applicationDefault() on Vercel — it hangs without GCP metadata.
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('FIREBASE_SERVICE_ACCOUNT is invalid JSON; Firebase auth disabled.', error);
  }
}

export function configureApp(app: INestApplication) {
  initializeFirebaseAdmin();

  app.use(helmet());
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3002')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  if (!process.env.VERCEL) {
    const config = new DocumentBuilder()
      .setTitle('ViralBridge API')
      .setDescription('The ViralBridge Backend API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
}
