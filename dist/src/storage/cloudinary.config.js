"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudinaryConfigured = isCloudinaryConfigured;
exports.ensureCloudinaryConfig = ensureCloudinaryConfig;
exports.getCloudinary = getCloudinary;
const cloudinary_1 = require("cloudinary");
let configured = false;
function isCloudinaryConfigured() {
    return Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
        process.env.CLOUDINARY_API_KEY?.trim() &&
        process.env.CLOUDINARY_API_SECRET?.trim());
}
function ensureCloudinaryConfig() {
    if (configured || !isCloudinaryConfigured())
        return;
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
        secure: true,
    });
    configured = true;
}
function getCloudinary() {
    ensureCloudinaryConfig();
    return cloudinary_1.v2;
}
//# sourceMappingURL=cloudinary.config.js.map