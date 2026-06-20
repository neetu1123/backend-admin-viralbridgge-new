type AnalyticsEmitter = (userId: string, payload: unknown) => void;
export declare function setAnalyticsEventEmitter(fn: AnalyticsEmitter): void;
export declare function emitAnalyticsUpdate(userId: string, payload: unknown): void;
export {};
