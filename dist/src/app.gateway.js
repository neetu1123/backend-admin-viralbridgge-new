"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const admin = __importStar(require("firebase-admin"));
const prisma_service_1 = require("./prisma/prisma.service");
const notification_emitter_1 = require("./common/notification-emitter");
const wallet_event_emitter_1 = require("./common/wallet-event-emitter");
let AppGateway = class AppGateway {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    onModuleInit() {
        (0, notification_emitter_1.setNotificationEmitter)((userId, notification) => this.emitNotification(userId, notification));
        (0, wallet_event_emitter_1.setWalletEventEmitter)((userId, event, payload) => this.emitWalletEvent(userId, event, payload));
    }
    server;
    async handleConnection(client) {
        try {
            const user = await this.resolveSocketUser(client);
            client.data.user = user;
            await client.join(`user:${user.id}`);
            const conversations = await this.prisma.conversation.findMany({
                where: {
                    OR: [
                        { brand: { user_id: user.id } },
                        { creator: { user_id: user.id } },
                    ],
                },
                select: { id: true },
            });
            await Promise.all(conversations.map((conversation) => client.join(`conversation:${conversation.id}`)));
        }
        catch {
            client.disconnect(true);
        }
    }
    handleDisconnect(_client) { }
    emitNotification(userId, notification) {
        if (this.server) {
            this.server.to(`user:${userId}`).emit('notification:new', notification);
        }
    }
    emitWalletEvent(userId, event, payload) {
        if (this.server) {
            this.server.to(`user:${userId}`).emit(event, payload);
        }
    }
    async handleSendMessage(client, payload) {
        const user = client.data.user;
        if (!user)
            throw new common_1.ForbiddenException('Socket is not authenticated');
        await this.assertConversationAccess(user.id, payload.conversationId);
        const message = await this.prisma.$transaction(async (tx) => {
            const created = await tx.message.create({
                data: {
                    conversation_id: payload.conversationId,
                    sender_id: user.id,
                    message: payload.message,
                    type: payload.type ?? 'text',
                    file_url: payload.fileUrl,
                    file_name: payload.fileName,
                    file_size: payload.fileSize,
                },
                include: { sender: true },
            });
            await tx.conversation.update({
                where: { id: payload.conversationId },
                data: { updated_at: new Date() },
            });
            return created;
        });
        this.server.to(`conversation:${payload.conversationId}`).emit('message:receive', message);
        return message;
    }
    handleNotification(payload) {
        this.server.to(`user:${payload.userId}`).emit('notification:new', payload.notification);
    }
    async handleTypingStart(client, payload) {
        const user = client.data.user;
        if (!user)
            return;
        await this.assertConversationAccess(user.id, payload.conversationId);
        client.to(`conversation:${payload.conversationId}`).emit('typing:start', { userId: user.id });
    }
    async handleTypingStop(client, payload) {
        const user = client.data.user;
        if (!user)
            return;
        await this.assertConversationAccess(user.id, payload.conversationId);
        client.to(`conversation:${payload.conversationId}`).emit('typing:stop', { userId: user.id });
    }
    async resolveSocketUser(client) {
        const token = this.extractSocketToken(client);
        if (!token) {
            throw new common_1.ForbiddenException('Missing socket token');
        }
        const jwtUser = await this.tryResolveJwtUser(token);
        if (jwtUser)
            return jwtUser;
        return this.tryResolveFirebaseUser(token);
    }
    async tryResolveJwtUser(token) {
        try {
            const jwt = require('jsonwebtoken');
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026');
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { role: true },
            });
            if (!user || user.is_banned || user.is_deleted)
                return null;
            return user;
        }
        catch {
            return null;
        }
    }
    async tryResolveFirebaseUser(token) {
        if (!admin.apps.length) {
            throw new common_1.ForbiddenException('Socket authentication failed');
        }
        const decoded = await admin.auth().verifyIdToken(token);
        const user = await this.prisma.user.findUnique({
            where: { firebase_uid: decoded.uid },
            include: { role: true },
        });
        if (!user || user.is_banned || user.is_deleted) {
            throw new common_1.ForbiddenException('Socket user is not allowed');
        }
        return user;
    }
    extractSocketToken(client) {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string')
            return authToken.replace(/^Bearer\s+/i, '');
        const header = client.handshake.headers.authorization;
        if (typeof header === 'string')
            return header.replace(/^Bearer\s+/i, '');
        return undefined;
    }
    async assertConversationAccess(userId, conversationId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { brand: { user_id: userId } },
                    { creator: { user_id: userId } },
                ],
            },
        });
        if (!conversation) {
            throw new common_1.ForbiddenException('Conversation access denied');
        }
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('notification:new'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleNotification", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleTypingStop", null);
exports.AppGateway = AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map