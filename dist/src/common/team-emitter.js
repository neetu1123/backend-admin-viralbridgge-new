"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTeamEventEmitter = setTeamEventEmitter;
exports.emitTeamInvited = emitTeamInvited;
exports.emitTeamAccepted = emitTeamAccepted;
let emitter = null;
function setTeamEventEmitter(fn) {
    emitter = fn;
}
function emitTeamInvited(userId, payload) {
    emitter?.(userId, 'team:invited', payload);
}
function emitTeamAccepted(userId, payload) {
    emitter?.(userId, 'team:accepted', payload);
}
//# sourceMappingURL=team-emitter.js.map