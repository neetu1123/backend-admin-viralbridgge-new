type SecurityEmitter = (userId: string, activity: unknown) => void;

let emitter: SecurityEmitter | null = null;

export function setSecurityEventEmitter(fn: SecurityEmitter) {
  emitter = fn;
}

export function emitSecurityActivityEvent(userId: string, activity: unknown) {
  emitter?.(userId, activity);
}
