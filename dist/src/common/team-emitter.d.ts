type TeamEventEmitter = (userId: string, event: string, payload: unknown) => void;
export declare function setTeamEventEmitter(fn: TeamEventEmitter): void;
export declare function emitTeamInvited(userId: string, payload: unknown): void;
export declare function emitTeamAccepted(userId: string, payload: unknown): void;
export {};
