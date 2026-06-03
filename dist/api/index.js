"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const app_module_1 = require("../src/app.module");
const bootstrap_1 = require("../src/bootstrap");
const server = (0, express_1.default)();
let cachedHandler;
async function bootstrapServerless() {
    if (cachedHandler)
        return cachedHandler;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server), {
        logger: ['error', 'warn', 'log'],
    });
    (0, bootstrap_1.configureApp)(app);
    await app.init();
    cachedHandler = (0, serverless_http_1.default)(server);
    return cachedHandler;
}
async function handler(req, res) {
    const serverlessHandler = await bootstrapServerless();
    return serverlessHandler(req, res);
}
//# sourceMappingURL=index.js.map