"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const api_response_interceptor_1 = require("./common/interceptors/api-response.interceptor");
const firebase_admin_config_1 = require("./firebase/firebase-admin.config");
async function configureApp(app) {
    (0, firebase_admin_config_1.initializeFirebaseAdmin)();
    if (!process.env.VERCEL) {
        app.use((0, helmet_1.default)());
    }
    app.enableCors({
        origin: (process.env.CORS_ORIGINS ||
            'http://localhost:3000,http://localhost:3001,http://localhost:3002,https://admin-viralbridgge-new.vercel.app,https://viralbridgge-new.vercel.app')
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
        const expressApp = app;
        expressApp.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    }
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