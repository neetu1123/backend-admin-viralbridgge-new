import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { initializeFirebaseAdmin } from './firebase/firebase-admin.config';

export async function configureApp(app: INestApplication) {
  initializeFirebaseAdmin();

  if (!process.env.VERCEL) {
    app.use(helmet());
  }

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ||
      'http://localhost:3000,http://localhost:3002,https://admin-viralbridgge-new.vercel.app')
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
