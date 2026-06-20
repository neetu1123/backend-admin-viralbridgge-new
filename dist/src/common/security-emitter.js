"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSecurityEventEmitter = setSecurityEventEmitter;
exports.emitSecurityActivityEvent = emitSecurityActivityEvent;
let emitter = null;
function setSecurityEventEmitter(fn) {
    emitter = fn;
}
function emitSecurityActivityEvent(userId, activity) {
    emitter?.(userId, activity);
}
//# sourceMappingURL=security-emitter.js.map