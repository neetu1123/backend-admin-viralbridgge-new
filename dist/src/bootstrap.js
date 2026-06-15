"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebaseAdmin = initializeFirebaseAdmin;
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const api_response_interceptor_1 = require("./common/interceptors/api-response.interceptor");
async function initializeFirebaseAdmin() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
    if (!serviceAccountJson) {
        return;
    }
    try {
        const admin = await import('firebase-admin');
        if (admin.apps.length)
            return;
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    catch (error) {
        console.error('FIREBASE_SERVICE_ACCOUNT is invalid JSON; Firebase auth disabled.', error);
    }
}
async function configureApp(app) {
    await initializeFirebaseAdmin();
    if (!process.env.VERCEL) {
        app.use((0, helmet_1.default)());
    }
    app.enableCors({
        origin: (process.env.CORS_ORIGINS ||
            'http://localhost:3000,http://localhost:3002,https://admin-viralbridgge-new.vercel.app')
            .split(',')
            .map((origin) => origin.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new api_response_interceptor_1.ApiResponseInterceptor());
    if (!process.env.VERCEL) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('ViralBridge API')
            .setDescription('The ViralBridge Backend API description')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
}
//# sourceMappingURL=bootstrap.js.map