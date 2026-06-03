import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from './prisma/prisma.service';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly prisma;
    constructor(prisma: PrismaService);
    server: Server;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(_client: Socket): void;
    handleSendMessage(client: Socket, payload: {
        message: string;
        conversationId: string;
        type?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: string;
    }): Promise<{
        message: string;
        id: string;
        created_at: Date;
        read_at: Date | null;
        conversation_id: string;
        sender_id: string;
    }>;
    handleNotification(payload: {
        userId: string;
        notification: unknown;
    }): void;
    handleTypingStart(client: Socket, payload: {
        conversationId: string;
    }): Promise<void>;
    handleTypingStop(client: Socket, payload: {
        conversationId: string;
    }): Promise<void>;
    private resolveSocketUser;
    private extractSocketToken;
    private assertConversationAccess;
}
