type TeamEventEmitter = (userId: string, event: string, payload: unknown) => void;

let emitter: TeamEventEmitter | null = null;

export function setTeamEventEmitter(fn: TeamEventEmitter) {
  emitter = fn;
}

export function emitTeamInvited(userId: string, payload: unknown) {
  emitter?.(userId, 'team:invited', payload);
}

export function emitTeamAccepted(userId: string, payload: unknown) {
  emitter?.(userId, 'team:accepted', payload);
}
