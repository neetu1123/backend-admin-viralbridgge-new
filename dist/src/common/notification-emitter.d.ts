type NotificationEmitter = (userId: string, notification: unknown) => void;
export declare function setNotificationEmitter(fn: NotificationEmitter): void;
export declare function emitNotificationEvent(userId: string, notification: unknown): void;
export {};
