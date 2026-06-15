type NotificationEmitter = (userId: string, notification: unknown) => void;

let emitter: NotificationEmitter | null = null;

export function setNotificationEmitter(fn: NotificationEmitter) {
  emitter = fn;
}

export function emitNotificationEvent(userId: string, notification: unknown) {
  emitter?.(userId, notification);
}
