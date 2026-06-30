import { v2 as cloudinary } from 'cloudinary';
export declare function isCloudinaryConfigured(): boolean;
export declare function ensureCloudinaryConfig(): void;
export declare function getCloudinary(): typeof cloudinary;
