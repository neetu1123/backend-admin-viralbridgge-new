type AnalyticsEmitter = (userId: string, payload: unknown) => void;

let emitter: AnalyticsEmitter | null = null;

export function setAnalyticsEventEmitter(fn: AnalyticsEmitter) {
  emitter = fn;
}

export function emitAnalyticsUpdate(userId: string, payload: unknown) {
  emitter?.(userId, payload);
}
