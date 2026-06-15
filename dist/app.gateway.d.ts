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
        sender: {
            name: string;
            id: string;
            status: string;
            updated_at: Date;
            created_at: Date;
            firebase_uid: string | null;
            password: string | null;
            email: string;
            avatar: string | null;
            role_id: string | null;
            is_verified: boolean;
            is_banned: boolean;
            is_deleted: boolean;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        message: string;
        id: string;
        created_at: Date;
        type: string;
        file_url: string | null;
        file_name: string | null;
        file_size: string | null;
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
