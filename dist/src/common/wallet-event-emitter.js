"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setWalletEventEmitter = setWalletEventEmitter;
exports.emitWalletEvent = emitWalletEvent;
let emitter = null;
function setWalletEventEmitter(fn) {
    emitter = fn;
}
function emitWalletEvent(userId, event, payload) {
    emitter?.(userId, event, payload);
}
//# sourceMappingURL=wallet-event-emitter.js.map