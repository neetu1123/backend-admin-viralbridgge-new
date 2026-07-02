"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_MAX_UPLOAD_BYTES = exports.PROFILE_IMAGE_MIMES = exports.DELIVERABLE_THUMBNAIL_MIMES = exports.DELIVERABLE_MAX_UPLOAD_BYTES = exports.DELIVERABLE_UPLOAD_MIMES = void 0;
exports.DELIVERABLE_UPLOAD_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
];
exports.DELIVERABLE_MAX_UPLOAD_BYTES = (Number(process.env.DELIVERABLE_MAX_UPLOAD_MB ?? 100) || 100) * 1024 * 1024;
exports.DELIVERABLE_THUMBNAIL_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
];
exports.PROFILE_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
];
exports.PROFILE_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
//# sourceMappingURL=storage.constants.js.map