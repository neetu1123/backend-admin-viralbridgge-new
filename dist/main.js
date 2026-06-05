"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const bootstrap_1 = require("./bootstrap");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await (0, bootstrap_1.configureApp)(app);
    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
//# sourceMappingURL=main.js.map