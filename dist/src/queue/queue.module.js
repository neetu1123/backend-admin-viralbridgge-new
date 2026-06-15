"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QueueModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
function redisConnection() {
    const redisUrl = process.env.REDIS_URL?.trim();
    if (!redisUrl)
        return null;
    let url;
    try {
        url = new URL(redisUrl);
    }
    catch {
        console.warn('Invalid REDIS_URL; BullMQ disabled.');
        return null;
    }
    return {
        host: url.hostname,
        port: Number(url.port || 6379),
        username: url.username || undefined,
        password: url.password || undefined,
        tls: url.protocol === 'rediss:' ? {} : undefined,
    };
}
let QueueModule = QueueModule_1 = class QueueModule {
    static register() {
        if (process.env.VERCEL) {
            return { module: QueueModule_1 };
        }
        const connection = redisConnection();
        if (!connection) {
            return { module: QueueModule_1 };
        }
        return {
            module: QueueModule_1,
            imports: [bullmq_1.BullModule.forRoot({ connection })],
            exports: [bullmq_1.BullModule],
        };
    }
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = QueueModule_1 = __decorate([
    (0, common_1.Module)({})
], QueueModule);
//# sourceMappingURL=queue.module.js.map