"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const crypto_1 = require("crypto");
const firebase_admin_config_1 = require("../firebase/firebase-admin.config");
const cloudinary_config_1 = require("./cloudinary.config");
const storage_constants_1 = require("./storage.constants");
let StorageService = StorageService_1 = class StorageService {
    logger = new common_1.Logger(StorageService_1.name);
    async uploadDeliverable(params) {
        this.assertAllowedFile(params.file, storage_constants_1.DELIVERABLE_UPLOAD_MIMES, 'file');
        if (params.thumbnail) {
            this.assertAllowedFile(params.thumbnail, storage_constants_1.DELIVERABLE_THUMBNAIL_MIMES, 'thumbnail');
        }
        const uploadFile = this.getUploadHandler();
        const main = await uploadFile(params.userId, params.file, params.campaignId);
        if (params.thumbnail) {
            const thumb = await uploadFile(params.userId, params.thumbnail, params.campaignId, 'thumbnails');
            main.thumbnailUrl = thumb.url;
        }
        return main;
    }
    getUploadHandler() {
        if ((0, cloudinary_config_1.isCloudinaryConfigured)()) {
            return this.uploadToCloudinary.bind(this);
        }
        if ((0, firebase_admin_config_1.isFirebaseConfigured)()) {
            return this.uploadToFirebase.bind(this);
        }
        return this.uploadToLocal.bind(this);
    }
    uploadToCloudinary(userId, file, campaignId, folder = 'files') {
        const folderPath = this.buildObjectPath(userId, file, campaignId, folder)
            .replace(/\.[^.]+$/, '')
            .replace(/\//g, '-');
        const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        return new Promise((resolve, reject) => {
            const stream = (0, cloudinary_config_1.getCloudinary)().uploader.upload_stream({
                folder: `viralbridge/deliverables/${userId}/${folder}`,
                public_id: folderPath,
                resource_type: resourceType,
                overwrite: false,
            }, (error, result) => {
                if (error || !result?.secure_url) {
                    reject(new common_1.BadRequestException(error?.message ?? 'Cloudinary upload failed'));
                    return;
                }
                resolve({
                    url: result.secure_url,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    storage: 'cloudinary',
                });
            });
            stream.end(file.buffer);
        });
    }
    assertAllowedFile(file, allowed, label) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException(`${label} is required`);
        }
        if (file.size > storage_constants_1.DELIVERABLE_MAX_UPLOAD_BYTES) {
            const maxMb = Math.round(storage_constants_1.DELIVERABLE_MAX_UPLOAD_BYTES / (1024 * 1024));
            throw new common_1.BadRequestException(`${label} exceeds maximum size of ${maxMb}MB`);
        }
        if (!allowed.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`${label} type "${file.mimetype}" is not allowed. Allowed: ${allowed.join(', ')}`);
        }
    }
    sanitizeFileName(name) {
        return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
    }
    buildObjectPath(userId, file, campaignId, folder = 'files') {
        const ext = (0, path_1.extname)(file.originalname) || this.extFromMime(file.mimetype);
        const safeName = this.sanitizeFileName(file.originalname.replace(ext, ''));
        const campaignPart = campaignId ? `${campaignId}/` : '';
        return `deliverables/${userId}/${campaignPart}${folder}/${Date.now()}-${(0, crypto_1.randomUUID)()}-${safeName}${ext}`;
    }
    extFromMime(mime) {
        const map = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'video/mp4': '.mp4',
            'video/webm': '.webm',
            'video/quicktime': '.mov',
        };
        return map[mime] ?? '';
    }
    async uploadToFirebase(userId, file, campaignId, folder = 'files') {
        const objectPath = this.buildObjectPath(userId, file, campaignId, folder);
        const bucket = (0, firebase_admin_config_1.getFirebaseBucket)();
        const gcsFile = bucket.file(objectPath);
        await gcsFile.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    uploadedBy: userId,
                    campaignId: campaignId ?? '',
                },
            },
            resumable: false,
        });
        try {
            await gcsFile.makePublic();
        }
        catch (error) {
            this.logger.warn(`Could not make ${objectPath} public; using signed-style public URL`);
        }
        const url = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;
        return {
            url,
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            storage: 'firebase',
        };
    }
    async uploadToLocal(userId, file, campaignId, folder = 'files') {
        if (process.env.VERCEL) {
            throw new common_1.BadRequestException('File upload requires cloud storage on Vercel. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (free tier), or configure Firebase Storage.');
        }
        const relativePath = this.buildObjectPath(userId, file, campaignId, folder);
        const absolutePath = (0, path_1.join)(process.cwd(), 'uploads', relativePath);
        await (0, promises_1.mkdir)((0, path_1.dirname)(absolutePath), { recursive: true });
        await (0, promises_1.writeFile)(absolutePath, file.buffer);
        const baseUrl = process.env.API_PUBLIC_URL?.replace(/\/$/, '') ||
            `http://localhost:${process.env.PORT ?? 4000}`;
        return {
            url: `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            storage: 'local',
        };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)()
], StorageService);
//# sourceMappingURL=storage.service.js.map