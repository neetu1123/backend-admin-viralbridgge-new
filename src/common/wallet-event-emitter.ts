type WalletEventEmitter = (userId: string, event: string, payload: unknown) => void;

let emitter: WalletEventEmitter | null = null;

export function setWalletEventEmitter(fn: WalletEventEmitter) {
  emitter = fn;
}

export function emitWalletEvent(userId: string, event: string, payload: unknown) {
  emitter?.(userId, event, payload);
}
