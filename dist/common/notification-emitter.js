"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNotificationEmitter = setNotificationEmitter;
exports.emitNotificationEvent = emitNotificationEvent;
let emitter = null;
function setNotificationEmitter(fn) {
    emitter = fn;
}
function emitNotificationEvent(userId, notification) {
    emitter?.(userId, notification);
}
//# sourceMappingURL=notification-emitter.js.map