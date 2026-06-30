export type UploadedFilePayload = {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
};
export type UploadResult = {
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
    storage: 'firebase' | 'local';
    thumbnailUrl?: string;
};
export declare class StorageService {
    private readonly logger;
    uploadDeliverable(params: {
        userId: string;
        file: UploadedFilePayload;
        thumbnail?: UploadedFilePayload;
        campaignId?: string;
    }): Promise<UploadResult>;
    private assertAllowedFile;
    private sanitizeFileName;
    private buildObjectPath;
    private extFromMime;
    private uploadToFirebase;
    private uploadToLocal;
}
