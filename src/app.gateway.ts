import { ForbiddenException, OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as admin from 'firebase-admin';
import { PrismaService } from './prisma/prisma.service';
import { setNotificationEmitter } from './common/notification-emitter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    setNotificationEmitter((userId, notification) => this.emitNotification(userId, notification));
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
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

      await Promise.all(
        conversations.map((conversation) => client.join(`conversation:${conversation.id}`)),
      );
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {}

  emitNotification(userId: string, notification: unknown) {
    if (this.server) {
      this.server.to(`user:${userId}`).emit('notification:new', notification);
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      message: string;
      conversationId: string;
      type?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: string;
    },
  ) {
    const user = client.data.user;
    if (!user) throw new ForbiddenException('Socket is not authenticated');

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

  @SubscribeMessage('notification:new')
  handleNotification(@MessageBody() payload: { userId: string; notification: unknown }) {
    this.server.to(`user:${payload.userId}`).emit('notification:new', payload.notification);
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const user = client.data.user;
    if (!user) return;
    await this.assertConversationAccess(user.id, payload.conversationId);
    client.to(`conversation:${payload.conversationId}`).emit('typing:start', { userId: user.id });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const user = client.data.user;
    if (!user) return;
    await this.assertConversationAccess(user.id, payload.conversationId);
    client.to(`conversation:${payload.conversationId}`).emit('typing:stop', { userId: user.id });
  }

  private async resolveSocketUser(client: Socket) {
    const token = this.extractSocketToken(client);
    if (!token) {
      throw new ForbiddenException('Missing socket token');
    }

    const jwtUser = await this.tryResolveJwtUser(token);
    if (jwtUser) return jwtUser;

    return this.tryResolveFirebaseUser(token);
  }

  private async tryResolveJwtUser(token: string) {
    try {
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'viralbridgge-super-secret-jwt-key-2026',
      ) as { sub: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || user.is_banned || user.is_deleted) return null;
      return user;
    } catch {
      return null;
    }
  }

  private async tryResolveFirebaseUser(token: string) {
    if (!admin.apps.length) {
      throw new ForbiddenException('Socket authentication failed');
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: decoded.uid },
      include: { role: true },
    });

    if (!user || user.is_banned || user.is_deleted) {
      throw new ForbiddenException('Socket user is not allowed');
    }

    return user;
  }

  private extractSocketToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string') return authToken.replace(/^Bearer\s+/i, '');

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string') return header.replace(/^Bearer\s+/i, '');

    return undefined;
  }

  private async assertConversationAccess(userId: string, conversationId: string) {
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
      throw new ForbiddenException('Conversation access denied');
    }
  }
}
