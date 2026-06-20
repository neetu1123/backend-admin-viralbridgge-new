type SecurityEmitter = (userId: string, activity: unknown) => void;
export declare function setSecurityEventEmitter(fn: SecurityEmitter): void;
export declare function emitSecurityActivityEvent(userId: string, activity: unknown): void;
export {};
