"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAnalyticsEventEmitter = setAnalyticsEventEmitter;
exports.emitAnalyticsUpdate = emitAnalyticsUpdate;
let emitter = null;
function setAnalyticsEventEmitter(fn) {
    emitter = fn;
}
function emitAnalyticsUpdate(userId, payload) {
    emitter?.(userId, payload);
}
//# sourceMappingURL=analytics-emitter.js.map