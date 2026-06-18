type WalletEventEmitter = (userId: string, event: string, payload: unknown) => void;
export declare function setWalletEventEmitter(fn: WalletEventEmitter): void;
export declare function emitWalletEvent(userId: string, event: string, payload: unknown): void;
export {};
